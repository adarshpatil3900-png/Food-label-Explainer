/**
 * Deterministic ingredient parser for food packaging text.
 * Finds ingredient headers, extracts the full block, and splits into individual ingredients.
 */

export interface ParsedIngredientsData {
  ingredients: string[];
  rawIngredientsBlock: string | null;
  containsAllergens: string[];
}

/**
 * Splits comma-separated ingredients while respecting parentheses
 * (e.g. "Enriched Flour (wheat flour, niacin, reduced iron), Sugar, Palm Oil")
 */
function splitIngredientsPreservingParens(text: string): string[] {
  const result: string[] = [];
  let current = "";
  let parenDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "(" || char === "[" || char === "{") {
      parenDepth++;
      current += char;
    } else if (char === ")" || char === "]" || char === "}") {
      if (parenDepth > 0) parenDepth--;
      current += char;
    } else if (char === "," && parenDepth === 0) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        result.push(trimmed);
      }
      current = "";
    } else if (char === ";" && parenDepth === 0) {
      // Semicolon also acts as a primary delimiter
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        result.push(trimmed);
      }
      current = "";
    } else {
      current += char;
    }
  }

  const lastTrimmed = current.trim();
  if (lastTrimmed.length > 0) {
    result.push(lastTrimmed);
  }

  return result;
}

/**
 * Cleans individual ingredient strings from stray OCR punctuation
 */
function cleanIngredientString(item: string): string {
  return item
    .replace(/^[\s•\-\*–\.\:\;]+/, "") // leading bullets / colons
    .replace(/[\s\.\:\;]+$/, "") // trailing periods / colons
    .replace(/\s+/g, " ") // normalize spacing
    .trim();
}

/**
 * Parses ingredients from raw OCR text.
 */
export function parseIngredients(rawText: string): ParsedIngredientsData {
  if (!rawText || typeof rawText !== "string") {
    return {
      ingredients: [],
      rawIngredientsBlock: null,
      containsAllergens: [],
    };
  }

  const normalizedText = rawText.replace(/\r\n/g, "\n");

  // Look for INGREDIENTS header
  // Matches: "INGREDIENTS:", "Ingredients :", "OTHER INGREDIENTS:", "INGREDIENT LIST:"
  const headerMatch = normalizedText.match(
    /(?:other\s+)?ingredients(?:\s*list)?[\s:.\-_]+/i
  );

  if (!headerMatch || headerMatch.index === undefined) {
    return {
      ingredients: [],
      rawIngredientsBlock: null,
      containsAllergens: [],
    };
  }

  const startIndex = headerMatch.index + headerMatch[0].length;
  const textAfterHeader = normalizedText.slice(startIndex);

  // Stop at boundary headers like "CONTAINS:", "ALLERGENS:", "DISTRIBUTED BY:", "MANUFACTURED FOR:", "NUTRITION FACTS", double newlines
  const endBoundaryMatch = textAfterHeader.match(
    /\n\s*(?:contains|allergens?|distributed\s+by|manufactured\s+by|keep\s+refrigerated|best\s+before|nutrition\s+facts|product\s+of)\b/i
  );

  let rawBlock = endBoundaryMatch && endBoundaryMatch.index !== undefined
    ? textAfterHeader.slice(0, endBoundaryMatch.index)
    : textAfterHeader;

  // If the block is very long, limit to first 1200 characters or before a major blank section
  const doubleNewlineIndex = rawBlock.search(/\n\s*\n/);
  if (doubleNewlineIndex !== -1 && doubleNewlineIndex > 20) {
    rawBlock = rawBlock.slice(0, doubleNewlineIndex);
  }

  // Also check for "CONTAINS:" allergen warning
  const allergenMatch = textAfterHeader.match(/contains[\s:.\-_]+([^\n\r.]+)/i);
  const containsAllergens: string[] = [];
  if (allergenMatch && allergenMatch[1]) {
    const allergenList = allergenMatch[1]
      .split(/[,;]/)
      .map((a) => cleanIngredientString(a))
      .filter((a) => a.length > 0 && a.length < 30);
    containsAllergens.push(...allergenList);
  }

  // Normalize newlines in block to spaces for comma splitting
  const singleLineBlock = rawBlock.replace(/\n+/g, " ").trim();

  // Split on commas while preserving parenthesized sub-ingredients
  const rawItems = splitIngredientsPreservingParens(singleLineBlock);

  const ingredients = rawItems
    .map(cleanIngredientString)
    .filter((item) => {
      // Filter out tiny noise fragments and huge paragraphs
      return (
        item.length > 1 &&
        item.length < 150 &&
        !/^contains\b/i.test(item) &&
        !/^may contain\b/i.test(item) &&
        !/^manufactured\b/i.test(item)
      );
    });

  return {
    ingredients,
    rawIngredientsBlock: singleLineBlock || null,
    containsAllergens,
  };
}
