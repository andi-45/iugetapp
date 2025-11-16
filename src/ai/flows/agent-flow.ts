
// src/ai/flows/agent-flow.ts
'use client';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type Content, type Part } from '@google/generative-ai';
import { getAgentById } from '@/services/agent-service';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- Types ---
export interface AgentFlowInput {
  agentId: string;
  prompt: string;
  image?: string; // data URI
  history: { role: 'user' | 'model'; content: string }[];
}

export interface AgentFlowOutput {
  response: string;
}

// Helper to fetch API keys from Firestore and select one randomly
async function getApiKey(): Promise<string> {
    const settingsDoc = await getDoc(doc(db, 'settings', 'apiKeys'));
    if (settingsDoc.exists() && settingsDoc.data().gemini) {
        const keysString = settingsDoc.data().gemini as string;
        const keys = keysString.split('\n').map(k => k.trim()).filter(Boolean);
        if (keys.length > 0) {
            return keys[Math.floor(Math.random() * keys.length)];
        }
    }
    // Fallback to environment variable if no key is in Firestore
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    }
    throw new Error("Clé API Gemini non configurée dans l'administration.");
}

// Helper to convert data URI to GenerativePart
function dataUriToGenerativePart(uri: string): Part {
  const [header, data] = uri.split(',');
  const mimeTypeMatch = header.match(/:(.*?);/);
  if (!mimeTypeMatch) {
    throw new Error("Invalid data URI format");
  }
  const mimeType = mimeTypeMatch[1];
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
}

export async function callAIAgent(input: AgentFlowInput): Promise<AgentFlowOutput> {
  const { agentId, prompt, image, history } = input;

  try {
    const agent = await getAgentById(agentId);
    if (!agent) {
      throw new Error(`Agent with ID "${agentId}" not found.`);
    }

    const API_KEY = await getApiKey();
    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: agent.systemPrompt,
      safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });
    
    const historyForAPI: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: historyForAPI });
    
    const promptParts: (string | Part)[] = [prompt];
    if (image) {
        promptParts.push(dataUriToGenerativePart(image));
    }

    const result = await chat.sendMessage(promptParts);
    const response = result.response;
    const text = response.text();

    return { response: text };

  } catch (error: any) {
    console.error('Error in AI Agent flow:', error);
    if (error.message.includes('API key') || error.message.includes('permission')) {
        throw new Error("La configuration de l'agent IA est invalide. Veuillez contacter le support de la plateforme.");
    }
    if (error.message.includes('[503]') || error.message.toLowerCase().includes('model is overloaded')) {
        throw new Error("Le service est actuellement surchargé. Veuillez patienter un moment et réessayer.");
    }
    throw error;
  }
}
