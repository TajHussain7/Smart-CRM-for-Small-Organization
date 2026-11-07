import { env } from "../../config/env";

interface FollowUpContext {
  customerName: string;
  module: "school" | "gym" | "barber";
  status: string;
  notes?: string;
}

export const generateFollowUpRecommendation = async (
  context: FollowUpContext
) => {
  if (env.aiEnabled && env.geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI assistant for a Smart Micro-CRM in Pakistan. Recommend a brief professional follow-up action for:
Customer: ${context.customerName}
Module: ${context.module}
Status: ${context.status}
Notes: ${context.notes ?? "None"}
Keep it under 3 sentences.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = (await response.json()) as any;
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return { recommendation: text, aiPowered: true };
    } catch (err) {
      console.warn("[AI Service] Gemini call failed, falling back to rule engine:", err);
    }
  }

  // Rule-based fallback recommendations
  let fallback = `Follow up with ${context.customerName} regarding their ${context.module} status (${context.status}).`;
  if (context.module === "school" && context.status === "Overdue") {
    fallback = `Send a polite fee reminder on WhatsApp to ${context.customerName}'s guardian regarding pending dues.`;
  } else if (context.module === "gym" && context.status === "Expiring Soon") {
    fallback = `Contact ${context.customerName} with an exclusive renewal discount offer before their membership lapses.`;
  } else if (context.module === "barber") {
    fallback = `Invite ${context.customerName} for a follow-up appointment or complimentary service upgrade.`;
  }

  return { recommendation: fallback, aiPowered: false };
};

export const generateOperationalSummary = async (
  moduleName: string,
  stats: Record<string, unknown>
) => {
  if (env.aiEnabled && env.geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Provide a concise 2-sentence executive summary of these daily CRM operational stats for ${moduleName}:
${JSON.stringify(stats, null, 2)}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = (await response.json()) as any;
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return { summary: text, aiPowered: true };
    } catch (err) {
      console.warn("[AI Service] Gemini summary failed, using fallback:", err);
    }
  }

  return {
    summary: `Operations for ${moduleName} are running smoothly with regular customer activity and scheduled services.`,
    aiPowered: false,
  };
};

