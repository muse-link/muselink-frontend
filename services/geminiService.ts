// services/geminiService.ts

export async function generateWithGemini(prompt: string): Promise<string> {
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
