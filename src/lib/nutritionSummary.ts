import { ParsedNutritionData } from "./parseNutrition";

export type TagType = "positive" | "caution" | "neutral";

export interface NutritionTag {
  id: string;
  label: string;
  type: TagType;
  detail: string;
}

/**
 * Generates rule-based nutrition summary tags using standard reference thresholds.
 * Simple, transparent, and deterministic.
 */
export function generateNutritionSummary(
  data: ParsedNutritionData
): NutritionTag[] {
  const tags: NutritionTag[] = [];

  // 1. Protein Evaluation
  if (data.protein) {
    const p = data.protein.value;
    if (p >= 10) {
      tags.push({
        id: "high-protein",
        label: "High Protein",
        type: "positive",
        detail: `${p}g protein per serving (≥ 20% Daily Value)`,
      });
    } else if (p >= 5) {
      tags.push({
        id: "good-protein",
        label: "Good Protein Source",
        type: "positive",
        detail: `${p}g protein per serving (≥ 10% Daily Value)`,
      });
    }
  }

  // 2. Dietary Fiber Evaluation
  if (data.fiber) {
    const f = data.fiber.value;
    if (f >= 5) {
      tags.push({
        id: "high-fiber",
        label: "High Fiber",
        type: "positive",
        detail: `${f}g fiber per serving (≥ 20% Daily Value)`,
      });
    } else if (f >= 2.8) {
      tags.push({
        id: "good-fiber",
        label: "Good Fiber Source",
        type: "positive",
        detail: `${f}g fiber per serving (≥ 10% Daily Value)`,
      });
    }
  }

  // 3. Sugar Evaluation
  if (data.sugar) {
    const s = data.sugar.value;
    if (s > 12) {
      tags.push({
        id: "high-sugar",
        label: "High Sugar",
        type: "caution",
        detail: `${s}g sugar per serving (exceeds 12g threshold)`,
      });
    } else if (s <= 2) {
      tags.push({
        id: "low-sugar",
        label: "Low Sugar",
        type: "positive",
        detail: `${s}g sugar per serving (≤ 2g per serving)`,
      });
    }
  }

  // 4. Sodium Evaluation
  if (data.sodium) {
    const sod = data.sodium.value;
    // Normalize to mg if unit was in grams (e.g., 0.5g salt = 500mg)
    const mg = data.sodium.unit === "g" ? sod * 1000 : sod;

    if (mg > 400) {
      tags.push({
        id: "high-sodium",
        label: "High Sodium",
        type: "caution",
        detail: `${mg}mg sodium per serving (high sodium threshold > 400mg)`,
      });
    } else if (mg <= 35) {
      tags.push({
        id: "very-low-sodium",
        label: "Very Low Sodium",
        type: "positive",
        detail: `${mg}mg sodium per serving (FDA ≤ 35mg standard)`,
      });
    } else if (mg <= 140) {
      tags.push({
        id: "low-sodium",
        label: "Low Sodium",
        type: "positive",
        detail: `${mg}mg sodium per serving (FDA ≤ 140mg standard)`,
      });
    }
  }

  // 5. Total Fat Evaluation
  if (data.fats) {
    const fat = data.fats.value;
    if (fat <= 3) {
      tags.push({
        id: "low-fat",
        label: "Low Fat",
        type: "positive",
        detail: `${fat}g total fat (FDA ≤ 3g standard)`,
      });
    } else if (fat >= 15) {
      tags.push({
        id: "high-fat",
        label: "High Fat",
        type: "caution",
        detail: `${fat}g total fat per serving`,
      });
    }
  }

  // 6. Calories Evaluation (if under 3 tags so far)
  if (tags.length < 3 && data.calories) {
    const cal = data.calories.value;
    if (cal <= 40) {
      tags.push({
        id: "low-calorie",
        label: "Low Calorie",
        type: "neutral",
        detail: `${cal} kcal per serving (≤ 40 kcal)`,
      });
    } else if (cal >= 400) {
      tags.push({
        id: "high-calorie",
        label: "Calorie Dense",
        type: "neutral",
        detail: `${cal} kcal per serving`,
      });
    }
  }

  // Limit to most relevant 4 tags
  return tags.slice(0, 4);
}
