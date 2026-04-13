import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function parseGradesFromImage(base64Image: string, mimeType: string = "image/png") {
  const genAI = getAI();
  
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          parts: [
            { text: "Extract all individual assessment/grade entries from this screenshot. Look for titles, scores, totals, and weights. Categorize the type as Test, Assignment, Quiz, Exam, or Other." },
            {
              inlineData: {
                data: base64Image.split(',')[1],
                mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              score: { type: Type.NUMBER },
              total: { type: Type.NUMBER },
              weight: { type: Type.NUMBER },
              type: { 
                type: Type.STRING,
                enum: ["Test", "Assignment", "Quiz", "Exam", "Other"]
              }
            },
            required: ["title", "score", "total"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Gemini Parsing Error:", e);
    return [];
  }
}
