
// src/ai/flows/ai-tutor-flow.ts

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type Content, type Part } from '@google/generative-ai';
import { evaluate } from 'mathjs';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- Types ---
export type AiTutorInput = {
    message: string;
    image?: string; // data URI
    history: Content[];
};

export type AiTutorOutput = {
    response: string;
    plotData?: {
        function: string;
        points: { x: number, y: number }[];
    } | null;
};

// --- Helpers ---

async function getApiKey(): Promise<string> {
    const settingsDoc = await getDoc(doc(db, 'settings', 'apiKeys'));
    if (settingsDoc.exists() && settingsDoc.data().gemini) {
        const keysString = settingsDoc.data().gemini as string;
        const keys = keysString.split('\n').map(k => k.trim()).filter(Boolean);
        if (keys.length > 0) {
            return keys[Math.floor(Math.random() * keys.length)];
        }
    }
    throw new Error("Clé API Gemini non configurée dans l'administration.");
}

async function getSystemInstruction(): Promise<string> {
    const settingsDoc = await getDoc(doc(db, 'settings', 'aiTutor'));
    if (settingsDoc.exists() && settingsDoc.data().systemPrompt) {
        return settingsDoc.data().systemPrompt;
    }
    // Fallback default prompt
    return `Vous êtes un Professeur Virtuel IA amical et serviable dans l'application OnBuch. Votre objectif est d'aider les étudiants camerounais à apprendre et à réussir. Si l'utilisateur vous demande de tracer ou de dessiner un graphique d'une fonction, informez-le que vous pouvez le faire et demandez-lui la fonction à tracer. Répondez toujours en français.`;
}

function dataUriToGenerativePart(uri: string): Part {
  const [header, data] = uri.split(',');
  const mimeTypeMatch = header.match(/:(.*?);/);
  if (!mimeTypeMatch) throw new Error("Invalid data URI format");
  const mimeType = mimeTypeMatch[1];
  return { inlineData: { mimeType, data } };
}

const checkForPlotRequest = (text: string): string | null => {
    const plotKeywords = ['trace', 'trace-moi', 'dessine', 'dessine-moi', 'graphique de'];
    const lowerText = text.toLowerCase();
    
    if (plotKeywords.some(keyword => lowerText.includes(keyword))) {
        const match = lowerText.match(/(?:f\(x\)\s*=\s*)?((?:[x\d\s\.\+\-\*\/\^\(\)]+){2,})/);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return null;
}

const generatePlotData = (func: string) => {
  const points: { x: number, y: number }[] = [];
  const min = -10, max = 10, steps = 100;
  const stepSize = (max - min) / steps;

  for (let i = 0; i <= steps; i++) {
    const x = min + i * stepSize;
    try {
      const y = evaluate(func, { x });
      if (typeof y === 'number' && isFinite(y)) {
        points.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
      }
    } catch (e) {
      console.warn(`Could not evaluate function at x=${x}:`, e);
    }
  }

  if (points.length === 0) return null;

  return { function: `f(x) = ${func}`, points };
}


// --- Fonction Principale ---

export async function callAiTutor(input: AiTutorInput): Promise<AiTutorOutput> {
  const { message, image, history } = input;
  
  try {
    const functionToPlot = checkForPlotRequest(message);
    if (functionToPlot && !image) { // Plotting only works for text-only requests
        const plotData = generatePlotData(functionToPlot);
        if (plotData) {
            return {
                response: `Voici le graphique de la fonction que vous avez demandée.`,
                plotData: plotData,
            };
        } else {
             return {
                response: `Désolé, je n'ai pas pu tracer la fonction "${functionToPlot}". Assurez-vous qu'elle est mathématiquement correcte.`,
            };
        }
    }

    const API_KEY = await getApiKey();
    const genAI = new GoogleGenerativeAI(API_KEY);
    const systemInstruction = await getSystemInstruction();

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });
    
    const chat = model.startChat({ history });

    const promptParts: (string | Part)[] = [message];
    if (image) {
        // When an image is present, it's better to put it first
        promptParts.unshift(dataUriToGenerativePart(image));
    }

    const result = await chat.sendMessage(promptParts);
    const response = result.response;
    const text = response.text();

    return { response: text };

  } catch (error: any) {
    console.error('Error in AI Tutor flow:', error);
    if (error.message.includes('API key') || error.message.includes('permission')) {
        throw new Error("La configuration du Tuteur IA est invalide. Veuillez contacter le support de la plateforme.");
    }
    if (error.message.includes('[503]') || error.message.toLowerCase().includes('model is overloaded')) {
        throw new Error("Le service est actuellement surchargé. Veuillez patienter un moment et réessayer.");
    }
    throw error;
  }
}
