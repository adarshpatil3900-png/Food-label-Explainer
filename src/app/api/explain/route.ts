import { NextRequest, NextResponse } from "next/server";
import { ParsedNutritionData } from "@/lib/parseNutrition";
import { ParsedIngredientsData } from "@/lib/parseIngredients";
import { NutritionTag } from "@/lib/nutritionSummary";

interface ExplainRequestBody {
  nutrition?: ParsedNutritionData;
  ingredientsData?: ParsedIngredientsData;
  summaryTags?: NutritionTag[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExplainRequestBody;
    const { nutrition, ingredientsData, summaryTags } = body;

    if (!nutrition && !ingredientsData) {
      return NextResponse.json(
        { error: "Invalid request payload. Nutrition or ingredients data required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_anthropic_api_key_here") {
      return NextResponse.json(
        {
          error: "API_KEY_MISSING",
          message:
            "Anthropic API key is not configured. Add ANTHROPIC_API_KEY to your .env.local file to enable live AI explanations.",
        },
        { status: 503 }
      );
    }

    // Format prompt content from parsed label data
    const nutrientSummary = [
      nutrition?.calories ? `Calories: ${nutrition.calories.value} ${nutrition.calories.unit}` : null,
      nutrition?.fats ? `Total Fat: ${nutrition.fats.value}${nutrition.fats.unit}` : null,
      nutrition?.carbs ? `Total Carbohydrates: ${nutrition.carbs.value}${nutrition.carbs.unit}` : null,
      nutrition?.sugar ? `Sugars: ${nutrition.sugar.value}${nutrition.sugar.unit}` : null,
      nutrition?.fiber ? `Dietary Fiber: ${nutrition.fiber.value}${nutrition.fiber.unit}` : null,
      nutrition?.protein ? `Protein: ${nutrition.protein.value}${nutrition.protein.unit}` : null,
      nutrition?.sodium ? `Sodium: ${nutrition.sodium.value}${nutrition.sodium.unit}` : null,
      nutrition?.servingSize ? `Serving Size: ${nutrition.servingSize}` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const ingredientsList =
      ingredientsData?.ingredients && ingredientsData.ingredients.length > 0
        ? ingredientsData.ingredients.join(", ")
        : "Not detected or not listed";

    const allergensList =
      ingredientsData?.containsAllergens && ingredientsData.containsAllergens.length > 0
        ? ingredientsData.containsAllergens.join(", ")
        : "None specifically declared";

    const tagsList =
      summaryTags && summaryTags.length > 0
        ? summaryTags.map((t) => `${t.label} (${t.detail})`).join("; ")
        : "None";

    const promptText = `Please analyze this packaged food label:

NUTRITION PROFILE:
${nutrientSummary || "No core nutrition metrics detected"}

INGREDIENTS:
${ingredientsList}

ALLERGENS:
${allergensList}

RULE-BASED SUMMARY HIGHLIGHTS:
${tagsList}

Respond strictly with a JSON object in this exact schema:
{
  "explanation": "A direct, plain-language explanation of this food's nutritional profile and ingredients. Highlight what stands out (e.g. macronutrient balance, notable ingredients, processing level, sodium/sugar density) without making alarmist statements or medical diagnoses. Write as a knowledgeable guide.",
  "takeaway": "A 2 to 4 sentence overall takeaway summarizing what this food is best suited for, and what to keep in mind when eating it."
}`;

    const systemPrompt = `You are a nutrition explanation assistant for a food label explainer tool.
Your goal is to provide honest, plain-language explanations of food labels for everyday consumers.
Guidelines:
- Explain the nutrition profile in plain, accessible language (assume a general audience, not a nutritionist).
- Briefly note anything notable about the ingredients if relevant (e.g. whole food bases vs refined ingredients, additives, sweeteners, sodium sources, allergens) without being alarmist or making medical claims.
- Give a short overall takeaway (2-4 sentences max for the takeaway).
- Avoid generic filler phrases like "As an AI", "It's important to note", or "In summary" — write directly and concisely.
- Return ONLY valid JSON matching {"explanation": string, "takeaway": string}. Do not wrap in markdown or backticks.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: promptText }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Anthropic API error:", response.status, errorBody);
        return NextResponse.json(
          {
            error: "API_ERROR",
            message: `Anthropic API error (${response.status}). Explanation unavailable right now.`,
          },
          { status: response.status >= 500 ? 502 : 400 }
        );
      }

      const data = await response.json();
      const contentBlock = data?.content?.[0];
      const rawText = contentBlock?.text || "";

      // Parse JSON response safely
      let parsedResponse: { explanation: string; takeaway: string };
      try {
        const cleanedText = rawText
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        parsedResponse = JSON.parse(cleanedText);
      } catch {
        // Fallback if model returned plain text rather than strict JSON
        parsedResponse = {
          explanation: rawText.trim(),
          takeaway: "Review the nutrition table and ingredients above to make an informed choice.",
        };
      }

      return NextResponse.json({
        explanation: parsedResponse.explanation || "No explanation text generated.",
        takeaway: parsedResponse.takeaway || "",
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr?.name === "AbortError") {
        return NextResponse.json(
          {
            error: "TIMEOUT",
            message: "Explanation generation timed out after 20 seconds. Please try again.",
          },
          { status: 504 }
        );
      }
      throw fetchErr;
    }
  } catch (err: any) {
    console.error("Unhandled error in /api/explain:", err);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: err?.message || "Failed to generate explanation due to an internal server error.",
      },
      { status: 500 }
    );
  }
}
