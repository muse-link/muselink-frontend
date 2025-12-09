// services/geminiService.ts

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/gemini`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    }
  );

  if (!response.ok) {
    console.error("Error desde backend /api/gemini:", response.status);
    throw new Error("Error al generar respuesta con IA");
  }

  const data = await response.json();
  return data.text;
}

// Función genérica por si la usas en otros componentes
export async function generateWithGemini(prompt: string): Promise<string> {
  return callGemini(prompt);
}

// Función específica que usa RequestFormModal
export async function enhanceDescription(description: string): Promise<string> {
  const prompt = `
Eres un asistente experto en redacción de requerimientos musicales para una plataforma tipo marketplace.

Toma la siguiente descripción escrita por un cliente y:
- Mejórala en redacción
- Mantén la intención original
- Hazla clara, atractiva y fácil de entender para músicos
- Usa un tono profesional pero cercano
- Responde SOLO con el texto mejorado, sin explicaciones adicionales.

Descripción original:
"${description}"
  `.trim();

  return callGemini(prompt);
}
