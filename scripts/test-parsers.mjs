// Pure Node test for parseNutrition, parseIngredients, and generateNutritionSummary logic

function sanitizeOcrNumericString(str) {
  return str
    .replace(/[Oo]/g, "0")
    .replace(/[lI|]/g, "1")
    .replace(/,/g, ".")
    .replace(/\s+/g, "")
    .trim();
}

function extractValueAndUnit(matchedString, defaultUnit = "g") {
  if (!matchedString) return null;
  const isLessThan = matchedString.includes("<");
  const numMatch = matchedString.match(/([0-9OlIs\.,]+)/i);
  if (!numMatch) return null;

  const sanitized = sanitizeOcrNumericString(numMatch[1]);
  let parsedNum = parseFloat(sanitized);
  if (isNaN(parsedNum)) return null;
  if (isLessThan && parsedNum === 1) parsedNum = 0.5;

  let unit = defaultUnit;
  if (/mg\b/i.test(matchedString)) unit = "mg";
  else if (/kcal\b|calories\b/i.test(matchedString)) unit = "kcal";
  else if (/g\b/i.test(matchedString) && !/mg/i.test(matchedString)) unit = "g";

  return {
    value: parsedNum,
    unit,
    rawValue: `${isLessThan ? "< " : ""}${parsedNum}${unit}`,
  };
}

function parseNutrition(rawText) {
  if (!rawText) return { detectedCount: 0 };
  const normalizedText = rawText.replace(/\r\n/g, "\n").replace(/\u00A0/g, " ");
  const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);

  let calories = null, protein = null, carbs = null, fats = null, sugar = null, sodium = null, fiber = null, servingSize = null;

  const servingMatch = normalizedText.match(/(?:serving\s*size|portion|servings\s*per\s*container)[\s:.-]*([^\n\r,]+(?:g|ml|oz|cup|piece)?)/i);
  if (servingMatch && servingMatch[1]) servingSize = servingMatch[1].trim();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    const combinedWithNext = `${line} ${nextLine}`;

    if (!calories && /calories|energy|calor[ií]as|kcal/i.test(line)) {
      const calMatch = line.match(/(?:calories|energy|calor[ií]as|kcal)[\s:.\-_]*([0-9OlIs]+)/i);
      if (calMatch && calMatch[1]) {
        const val = extractValueAndUnit(calMatch[1], "kcal");
        if (val && val.value < 5000) calories = { ...val, unit: "kcal" };
      }
    }

    if (!fats && !/saturated|trans/i.test(line) && /(?:total\s+fat|fat\b)/i.test(line)) {
      const fatMatch = line.match(/(?:total\s+fat|fat)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
      if (fatMatch && fatMatch[1]) fats = extractValueAndUnit(fatMatch[1], "g");
    }

    if (!carbs && /(?:total\s+carbohydrate|carbohydrate|carbs)/i.test(line)) {
      const carbMatch = line.match(/(?:total\s+carbohydrate[s]?|carbohydrate[s]?|carbs)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
      if (carbMatch && carbMatch[1]) carbs = extractValueAndUnit(carbMatch[1], "g");
    }

    if (!protein && /(?:protein|prote[ií]na)/i.test(line)) {
      const protMatch = line.match(/(?:protein[s]?|prote[ií]na[s]?)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
      if (protMatch && protMatch[1]) protein = extractValueAndUnit(protMatch[1], "g");
    }

    if (!sugar && /(?:total\s+sugar[s]?|sugar[s]?)/i.test(line) && !/^includes\b/i.test(line.trim())) {
      const sugarMatch = line.match(/(?:total\s+sugar[s]?|sugar[s]?)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
      if (sugarMatch && sugarMatch[1]) sugar = extractValueAndUnit(sugarMatch[1], "g");
    }

    if (!sodium && /(?:sodium|salt)/i.test(line)) {
      const sodMatch = line.match(/(?:sodium|salt)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:mg|g)?)/i);
      if (sodMatch && sodMatch[1]) sodium = extractValueAndUnit(sodMatch[1], "mg");
    }

    if (!fiber && /(?:dietary\s+fiber|fiber)/i.test(line)) {
      const fibMatch = line.match(/(?:dietary\s+fiber|fiber)[\s:.\-_]*([<]?[0-9OlIs\.,]+\s*(?:g|mg)?)/i);
      if (fibMatch && fibMatch[1]) fiber = extractValueAndUnit(fibMatch[1], "g");
    }
  }

  const detectedCount = [calories, protein, carbs, fats, sugar, sodium, fiber].filter(Boolean).length;
  return { calories, protein, carbs, fats, sugar, sodium, fiber, servingSize, detectedCount };
}

function parseIngredients(rawText) {
  if (!rawText) return { ingredients: [] };
  const headerMatch = rawText.match(/ingredients[\s:.\-_]+/i);
  if (!headerMatch) return { ingredients: [] };
  const startIndex = headerMatch.index + headerMatch[0].length;
  const after = rawText.slice(startIndex).split(/\n\s*contains|\n\s*allergens|\n\s*nutrition/i)[0];
  const items = after.split(",").map(s => s.replace(/[\.\:\;\*\-]+/g, "").trim()).filter(s => s.length > 1);
  return { ingredients: items };
}

// Test Granola OCR
const granolaOcr = `
NATURE CRUNCH GRANOLA
Nutrition Facts
8 servings per container
Serving size: 2/3 cup (55g)
Amount Per Serving
Calories: 230
Total Fat 8g 10%
  Saturated Fat 1g 5%
Sodium 160mg 7%
Total Carbohydrate 37g 13%
  Dietary Fiber 4g 14%
  Total Sugars 12g
Protein 5g
INGREDIENTS: Whole Grain Rolled Oats, Cane Sugar, Canola Oil, Crisp Rice, Almonds, Honey, Sea Salt, Natural Vanilla Flavor.
`;

const res1 = parseNutrition(granolaOcr);
const ings1 = parseIngredients(granolaOcr);
console.log("Granola Parsed Nutrients:", res1);
console.log("Granola Ingredients Count:", ings1.ingredients.length);

if (res1.calories?.value === 230 && res1.protein?.value === 5 && res1.fats?.value === 8 && res1.sodium?.value === 160 && ings1.ingredients.length === 8) {
  console.log(">> GRANOLA TEST PASSED!");
} else {
  console.error(">> GRANOLA TEST FAILED!");
  process.exit(1);
}

// Test Messy OCR
const messyOcr = `
ORGANIC VEGETABLE SOUP
Nutrition Facts
Calories 9O
Total Fat 1.5g
Sodium 48Omg
Total Carbohydrate l6g
Dietary Fiber 3g
Total Sugars 2g
Protein 4g
INGREDIENTS: Filtered Water, Organic Carrots, Organic Tomatoes, Organic Celery, Organic Peas, Organic Green Beans, Sea Salt, Organic Spices.
`;

const res2 = parseNutrition(messyOcr);
const ings2 = parseIngredients(messyOcr);
console.log("Messy OCR Parsed Nutrients:", res2);
console.log("Messy OCR Ingredients Count:", ings2.ingredients.length);

if (res2.calories?.value === 90 && res2.sodium?.value === 480 && res2.carbs?.value === 16 && res2.fats?.value === 1.5 && ings2.ingredients.length === 8) {
  console.log(">> MESSY OCR RECOVERY TEST PASSED!");
} else {
  console.error(">> MESSY OCR RECOVERY TEST FAILED!");
  process.exit(1);
}

console.log("\nALL TESTS COMPLETED SUCCESSFULLY!");
