import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type ContentMode = 'description' | 'ad' | 'title';

export async function generateContent(
  mode: ContentMode,
  productName: string,
  features: string,
  audience: string
) {
  let systemInstruction = "";
  let prompt = `Product Name: ${productName}\nKey Features: ${features}\nTarget Audience: ${audience || 'General'}\n\n`;

  switch (mode) {
    case 'description':
      systemInstruction = "You are an expert eCommerce copywriter. Write a compelling, SEO-friendly product description that highlights benefits and persuades the customer to buy. Output clean text with paragraph breaks if necessary, without markdown formatting.";
      prompt += "Write a highly engaging product description.";
      break;
    case 'ad':
      systemInstruction = "You are a top-tier digital marketer. Write catchy, conversion-focused ad copy suitable for Facebook or Google Ads. Keep it short and punchy.";
      prompt += "Write 2-3 short variations of ad copy with a strong Call to Action. Separate them by newlines. Do not use markdown like * or #.";
      break;
    case 'title':
      systemInstruction = "You are an SEO specialist for eCommerce. Optimize product titles for search visibility and click-through rates. Output only the titles, one per line.";
      prompt += "Provide 5 optimized title options that are descriptive, keyword-rich, and no longer than 60-80 characters each. Do not use markdown or numbering.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    
    return response.text || "No content generated. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please check your API key and try again.");
  }
}
