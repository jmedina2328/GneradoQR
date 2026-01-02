
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse } from "../types";

export const getSmartSuggestions = async (appName: string): Promise<SuggestionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Actúa como un experto en sistemas de control escolar para la app "${appName}".
    Necesito generar un JSON para un código QR que contenga exactamente esta estructura de claves:
    1. nombre (Nombre completo del alumno)
    2. id (DNI o número de identificación)
    3. GS (Grado y Sección combinados, ejemplo: "5G")
    4. tutor (Nombre del tutor legal)
    5. contacto (Teléfono de contacto)
    
    Proporciona valores de ejemplo realistas para un estudiante.
    
    Responde estrictamente en formato JSON:
    {
      "fields": [{"key": "string", "value": "string", "description": "string"}],
      "explanation": "explicación de por qué la clave GS combinada es eficiente para esta aplicación"
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING },
                value: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["key", "value", "description"]
            }
          },
          explanation: { type: Type.STRING }
        },
        required: ["fields", "explanation"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    throw new Error("Error en la sugerencia de IA");
  }
};
