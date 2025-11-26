import { GoogleGenAI, Modality } from "@google/genai";
import { Emotion, PrebuiltVoice } from "../types";

const createClient = () => {
    // apiKey is expected to be in process.env.API_KEY
    // In a real app, we might handle missing keys gracefully, but instructions say assume valid.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSpeech = async (
  text: string,
  emotion: Emotion,
  voiceName: PrebuiltVoice
): Promise<string> => {
  const ai = createClient();
  
  // Construct a prompt that guides the style
  const promptText = `Say ${emotion.toLowerCase()}: ${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: promptText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio data received from Gemini API");
  }

  return base64Audio;
};
