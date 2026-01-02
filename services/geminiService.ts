
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse } from "../types";

export const getSmartSuggestions = async (appName: string): Promise<SuggestionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza el nombre de la aplicación "${appName}" y sugiere una estructura de datos JSON común que este tipo de aplicación de asistencia podría usar en sus códigos QR. 
    Proporciona campos típicos como identificación de usuario, nombre, fecha, o tokens de seguridad.
    
    Responde estrictamente en formato JSON con la siguiente estructura:
    {
      "fields": [{"key": "nombre_del_campo", "value": "ejemplo_valor", "description": "para que sirve"}],
      "explanation": "breve explicacion en español"
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
    console.error("Error parsing Gemini response", error);
    throw new Error("No se pudo obtener una sugerencia válida.");
  }
};
