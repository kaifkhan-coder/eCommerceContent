import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type ContentMode = 'description' | 'ad' | 'title' | 'image-analysis';

export async function generateContent(
  mode: ContentMode,
  productName: string,
  features: string,
  audience: string,
  mrp: string,
  sellingPrice: string,
  imageData?: { mimeType: string; data: string }
) {
  let systemInstruction = "";
  let contents: any[] = [];
  let promptText = `Product Name: ${productName}\nKey Features: ${features}\nTarget Audience: ${audience || 'General'}\n`;
  if (mrp) promptText += `MRP: ${mrp}\n`;
  if (sellingPrice) promptText += `Selling Price: ${sellingPrice}\n`;
  promptText += `\n`;

  switch (mode) {
    case 'description':
      systemInstruction = "You are an expert eCommerce copywriter. Write a compelling, SEO-friendly product description that highlights benefits and persuades the customer to buy. Output clean text with paragraph breaks if necessary, without markdown formatting.";
      promptText += "Write a highly engaging product description.";
      break;
    case 'ad':
      systemInstruction = "You are a top-tier digital marketer. Write catchy, conversion-focused ad copy suitable for Facebook or Google Ads. Keep it short and punchy.";
      promptText += "Write 2-3 short variations of ad copy with a strong Call to Action. Separate them by newlines. Do not use markdown like * or #.";
      break;
    case 'title':
      systemInstruction = "You are an SEO specialist for eCommerce. Optimize product titles for search visibility and click-through rates. Output only the titles, one per line.";
      promptText += "Provide 5 optimized title options that are descriptive, keyword-rich, and no longer than 60-80 characters each. Do not use markdown or numbering.";
      break;
    case 'image-analysis':
      systemInstruction = "You are an expert eCommerce assistant. Analyze the image to extract and infer product details. Format your output as plain text cleanly, without using markdown like * or #.";
      promptText += "Based on this image, write a compelling product description.";
      if (!mrp && !sellingPrice) {
        promptText += " Also infer or estimate the MRP (Maximum Retail Price), a suggested Selling Price, and list key features/specifications you can identify from the image.";
      } else {
        promptText += " Ensure you highlight the value factor based on the provided MRP and Selling price. List key features/specifications you can identify from the image.";
      }
      break;
  }

  const parts: any[] = [];
  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: imageData.mimeType,
        data: imageData.data
      }
    });
  }
  parts.push({ text: promptText });
  
  contents.push({ role: 'user', parts });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
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
