/**
 * Deterministic, rule-based nutrition parser for food labels.
 * Parses raw OCR text into structured nutrient numbers and units.
 */

export interface NutrientValue {
  value: number;
  unit: string;
  rawValue: string;
}

export interface ParsedNutritionData {
  calories: NutrientValue | null;
  protein: NutrientValue | null;
  carbs: NutrientValue | null;
  fats: NutrientValue | null;
  sugar: NutrientValue | null;
  sodium: NutrientValue | null;
  fiber: NutrientValue | null;
  servingSize: string | null;
  detectedCount: number;
}

/**
 * Normalizes common OCR character misreads in numeric strings
 * (e.g. 'O'/'o' -> '0', 'l'/'I'/'|' -> '1', 'S'/'s' -> '5', commas to periods)
 */
function sanitizeOcrNumericString(str: string): string {
  return str
    .replace(/[Oo]/g, "0")
    .replace(/[lI|]/g, "1")
    .replace(/,/g, ".")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Extracts a numeric value and optional unit from text matching a nutrient pattern
 */
function extractValueAndUnit(
  matchedString: string,
  defaultUnit: string = "g"
): NutrientValue | null {
  if (!matchedString) return null;

  // Match the first valid decimal/integer number
  // Handling cases like "8g", "8.5 g", "160mg", "230", "12 g (24%)", "< 1g", "<1g"
  const isLessThan = matchedString.includes("<");
  
  // Find numeric portion
  const numMatch = matchedString.match(/([0-9OlIs\.,]+)/i);
  if (!numMatch) return null;

  const sanitized = sanitizeOcrNumericString(numMatch[1]);
  let parsedNum = parseFloat(sanitized);

  if (isNaN(parsedNum)) return null;

  if (isLessThan && parsedNum === 1) {
    parsedNum = 0.5; // Represent < 1g as 0.5 for calculation
  }

  // Detect unit in matched string (mg, g, kcal, cal)
  let unit = defaultUnit;
  if (/mg\b/i.test(matchedString)) {
    unit = "mg";
  } else if (/kcal\b|calories\b/i.test(matchedString)) {
    unit = "kcal";
  } else if (/g\b/i.test(matchedString) && !/mg/i.test(matchedString)) {
    unit = "g";
  } else if (/mcg|µg\b/i.test(matchedString)) {
    unit = "mcg";
  }

  return {
    value: parsedNum,
    unit,
    rawValue: `${isLessThan ? "< " : ""}${parsedNum}${unit}`,
  };
}

/**
 * Parses raw OCR text into a structured nutrition data object.
 */
export function parseNutrition(rawText: string): ParsedNutritionData {
  if (!rawText || typeof rawText !== "string") {
    return {
      calories: null,
      protein: null,
      carbs: null,
      fats: null,
      sugar: null,
      sodium: null,
      fiber: null,
      servingSize: null,
      detectedCount: 0,
    };
  }

  // Normalize lines and replace non-breaking spaces
  const normalizedText = rawText.replace(/\r\n/g, "\n").replace(/\u00A0/g, " ");
  const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);

  let calories: NutrientValue | null = null;
  let protein: NutrientValue | null = null;
  let carbs: NutrientValue | null = null;
  let fats: NutrientValue | null = null;
  let sugar: NutrientValue | null = null;
  let sodium: NutrientValue | null = null;
  let fiber: NutrientValue | null = null;
  let servingSize: string | null = null;

  // 1. Extract Serving Size
  const servingSizeRegex =
    /(?:serving\s*size|portion|servings\s*per\s*container|portion\s*size)[\s:.-]*([^\n\r,]+(?:g|ml|oz|cup|piece|tablespoon|tbsp|tsp|g\))?)/i;
  const servingMatch = normalizedText.match(servingSizeRegex);
  if (servingMatch && servingMatch[1]) {
    const rawServing = servingMatch[1].trim();
    if (rawServing.length > 2 && rawServing.length < 60) {
      servingSize = rawServing.replace(/^[:\s-]+/, "");
    }
  }

  // 2. Line-by-line & global pattern matching for nutrients
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    const combinedWithNext = `${line} ${nextLine}`;

    // --- CALORIES ---
    if (!calories) {
      // Matches: "Calories: 230", "Calories 230", "Energy: 960 kJ / 230 kcal", "Calories per serving 230"
      if (/calories|energy|calor[ií]as|kcal/i.test(line)) {
        // Look for number in current line
        const calMatch = line.match(/(?:calories|energy|calor[ií]as|kcal)[\s:.\-_]*([0-9OlIs]+)/i);
        if (calMatch && calMatch[1]) {
          const val = extractValueAndUnit(calMatch[1], "kcal");
          if (val && val.value < 5000) {
            calories = { ...val, unit: "kcal" };
          }
        } else if (/^[0-9OlIs]{2,4}$/.test(nextLine)) {
          // Number is on the next line
          const val = extractValueAndUnit(nextLine, "kcal");
          if (val && val.value < 5000) {
            calories = { ...val, unit: "kcal" };
          }
        }
      }
    }

    // --- TOTAL FAT / FAT ---
    if (!fats) {
      // Avoid matching "Saturated Fat" or "Trans Fat" as Total Fat
      const isSaturatedOrTrans = /saturated|trans|mono|poly/i.test(line);
      if (!isSaturatedOrTrans && /(?:total\s+fat|fat\b|grasa\s+total|lipides|mati[eè]res\s+grasses)/i.test(line)) {
        const fatMatch = line.match(/(?:total\s+fat|fat|grasa\s+total|lipides|mati[eè]res\s+grasses)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
        if (fatMatch && fatMatch[1]) {
          fats = extractValueAndUnit(fatMatch[1], "g");
        } else {
          // Check if number is in combined line
          const combMatch = combinedWithNext.match(/(?:total\s+fat|fat)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
          if (combMatch && combMatch[1]) {
            fats = extractValueAndUnit(combMatch[1], "g");
          }
        }
      }
    }

    // --- TOTAL CARBOHYDRATE / CARBS ---
    if (!carbs) {
      if (/(?:total\s+carbohydrate|carbohydrate|total\s+carbs|carbs|gl[uú]cidos|glucides|hydrate[s]?\s+de\s+carbone)/i.test(line)) {
        const carbMatch = line.match(/(?:total\s+carbohydrate[s]?|carbohydrate[s]?|total\s+carbs|carbs|gl[uú]cidos|glucides)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
        if (carbMatch && carbMatch[1]) {
          carbs = extractValueAndUnit(carbMatch[1], "g");
        } else {
          const combMatch = combinedWithNext.match(/(?:total\s+carbohydrate|carbohydrate|carbs)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
          if (combMatch && combMatch[1]) {
            carbs = extractValueAndUnit(combMatch[1], "g");
          }
        }
      }
    }

    // --- PROTEIN ---
    if (!protein) {
      if (/(?:protein|prote[ií]na|prot[eé]ines)/i.test(line)) {
        const protMatch = line.match(/(?:protein[s]?|prote[ií]na[s]?|prot[eé]ines)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
        if (protMatch && protMatch[1]) {
          protein = extractValueAndUnit(protMatch[1], "g");
        } else {
          const combMatch = combinedWithNext.match(/(?:protein[s]?|prote[ií]na[s]?)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
          if (combMatch && combMatch[1]) {
            protein = extractValueAndUnit(combMatch[1], "g");
          }
        }
      }
    }

    // --- SUGARS / TOTAL SUGARS ---
    if (!sugar) {
      // Prioritize "Total Sugars" or "Sugars", avoid standalone "Includes 10g Added Sugars" if Total Sugars exists
      if (/(?:total\s+sugar[s]?|sugar[s]?|az[uú]cares|sucres)/i.test(line)) {
        const isAddedOnly = /^includes\b/i.test(line.trim());
        if (!isAddedOnly) {
          const sugarMatch = line.match(/(?:total\s+sugar[s]?|sugar[s]?|az[uú]cares|sucres)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
          if (sugarMatch && sugarMatch[1]) {
            sugar = extractValueAndUnit(sugarMatch[1], "g");
          } else {
            const combMatch = combinedWithNext.match(/(?:total\s+sugars?|sugars?)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
            if (combMatch && combMatch[1]) {
              sugar = extractValueAndUnit(combMatch[1], "g");
            }
          }
        }
      }
    }

    // --- SODIUM / SALT ---
    if (!sodium) {
      if (/(?:sodium|sodio|sel|salt)/i.test(line)) {
        const sodMatch = line.match(/(?:sodium|sodio|sel|salt)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:mg|g)?)/i);
        if (sodMatch && sodMatch[1]) {
          sodium = extractValueAndUnit(sodMatch[1], "mg");
        } else {
          const combMatch = combinedWithNext.match(/(?:sodium|sodio|salt)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:mg|g)?)/i);
          if (combMatch && combMatch[1]) {
            sodium = extractValueAndUnit(combMatch[1], "mg");
          }
        }
      }
    }

    // --- DIETARY FIBER / FIBER ---
    if (!fiber) {
      if (/(?:dietary\s+fiber|fiber|fibre|fibra\s+diet[eé]tica|fibra)/i.test(line)) {
        const fibMatch = line.match(/(?:dietary\s+fiber|fiber|fibre|fibra)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
        if (fibMatch && fibMatch[1]) {
          fiber = extractValueAndUnit(fibMatch[1], "g");
        } else {
          const combMatch = combinedWithNext.match(/(?:dietary\s+fiber|fiber|fibre)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
          if (combMatch && combMatch[1]) {
            fiber = extractValueAndUnit(combMatch[1], "g");
          }
        }
      }
    }
  }

  // Fallback global search across entire text if some fields were missed due to unusual line wraps
  if (!calories) {
    const match = normalizedText.match(/(?:calories|energy)[\s:.\-_]+([0-9OlIs]{1,4})\b/i);
    if (match && match[1]) {
      const val = extractValueAndUnit(match[1], "kcal");
      if (val && val.value < 5000) calories = { ...val, unit: "kcal" };
    }
  }

  if (!fats) {
    const match = normalizedText.match(/Total\s+Fat[\s:.\-_]+([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
    if (match && match[1]) fats = extractValueAndUnit(match[1], "g");
  }

  if (!carbs) {
    const match = normalizedText.match(/Total\s+Carbohydrate[\s:.\-_]+([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
    if (match && match[1]) carbs = extractValueAndUnit(match[1], "g");
  }

  if (!protein) {
    const match = normalizedText.match(/Protein[\s:.\-_]+([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
    if (match && match[1]) protein = extractValueAndUnit(match[1], "g");
  }

  if (!sugar) {
    const match = normalizedText.match(/(?:Total\s+Sugars?|Sugars?)[\s:.\-_]+([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
    if (match && match[1]) sugar = extractValueAndUnit(match[1], "g");
  }

  if (!sodium) {
    const match = normalizedText.match(/Sodium[\s:.\-_]+([<]?[0-9OlIs\.,]+\s*(?:mg|g)?)/i);
    if (match && match[1]) sodium = extractValueAndUnit(match[1], "mg");
  }

  if (!fiber) {
    const match = normalizedText.match(/(?:Dietary\s+Fiber|Fiber)[\s:.\-_]+([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
    if (match && match[1]) fiber = extractValueAndUnit(match[1], "g");
  }

  // Count detected nutrients
  const detectedCount = [calories, protein, carbs, fats, sugar, sodium, fiber].filter(
    (item) => item !== null
  ).length;

  return {
    calories,
    protein,
    carbs,
    fats,
    sugar,
    sodium,
    fiber,
    servingSize,
    detectedCount,
  };
}
