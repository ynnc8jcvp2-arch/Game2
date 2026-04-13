import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    // @ts-ignore
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment.");
    }
    // @ts-ignore
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
}

export async function parseGradesFromImage(base64Image: string, mimeType: string = "image/png") {
  const ai = getGenAI();
  // @ts-ignore
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are an expert academic data parser. Extract all individual assessment/grade entries from this screenshot.
    
    Rules:
    1. Look for titles (e.g., "Unit 1 Test", "Lab 2"), scores (e.g., 45/50), and weights (e.g., 15%).
    2. If a weight is missing, estimate it based on the task type (Test: 15%, Quiz: 5%, Assignment: 10%, Exam: 30%) or return 10 as a default.
    3. Categorize the type as one of: "Test", "Assignment", "Quiz", "Exam", "Other".
    4. Return ONLY a valid JSON array of objects.
    
    Structure:
    {
      "title": string,
      "score": number,
      "total": number,
      "weight": number,
      "type": "Test" | "Assignment" | "Quiz" | "Exam" | "Other"
    }
    
    If no grades are found, return [].
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Gemini Parsing Error:", e);
    return [];
  }
}
