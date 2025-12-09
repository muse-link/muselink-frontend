import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enhanceDescription = async (currentDescription: string, genre: string, title: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Eres un asistente experto para una aplicación de mercado musical (tipo marketplace para músicos).
      Un cliente está intentando contratar a un músico.
      
      Título de la Solicitud: "${title}"
      Género: "${genre}"
      Borrador Actual: "${currentDescription}"

      Por favor, reescribe y mejora el "Borrador Actual" para que sea profesional, claro y atractivo para los músicos.
      Incluye detalles sobre lo que podría necesitarse (equipo, duración, ambiente) basándote en el género musical.
      El idioma DEBE SER ESPAÑOL.
      Manténlo en menos de 100 palabras. Devuelve SOLAMENTE el texto mejorado.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return currentDescription; // Fallback to original
  }
};