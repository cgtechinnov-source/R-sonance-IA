import { GoogleGenAI, Chat } from "@google/genai";
import { CategoryId } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface TopicResponse {
  text: string;
  sources?: Array<{ title?: string; uri: string }>;
}

export const generateTopic = async (
  categoryId: CategoryId,
  topicPrompt: string
): Promise<TopicResponse> => {
  
  const basePrompt = `Génère un sujet de conversation engageant, profond et nuancé sur : ${topicPrompt}.
  
  Le résultat doit être formaté ainsi :
  1. Un titre accrocheur.
  2. Une brève mise en contexte ou une anecdote (1-2 phrases).
  3. Une question ouverte principale pour lancer le débat.
  4. Deux sous-questions pour approfondir.
  
  Réponds directement en Français. Sois créatif et évite les clichés.`;

  try {
    // STRATEGY 1: History/Facts or Random (General Knowledge)
    if (categoryId === 'history' || categoryId === 'random') {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: basePrompt,
        config: {
          // Only use search for history, keeping random purely generative for creativity unless specified
          tools: categoryId === 'history' ? [{ googleSearch: {} }] : undefined,
        },
      });

      const text = response.text || "Désolé, je n'ai pas pu générer de contenu pour le moment.";
      
      // Extract grounding sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks
        ?.filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          title: c.web?.title || 'Source Web',
          uri: c.web?.uri,
        })) || [];

      return { text, sources };
    } 
    
    // STRATEGY 2: Use Gemini 3 Pro + Thinking for Complex/Relations/Tense
    else {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: basePrompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for deep reasoning
        },
      });

      const text = response.text || "Désolé, la réflexion a pris trop de temps.";
      return { text };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Impossible de contacter l'IA pour le moment.");
  }
};

export const createDebateChat = (initialTopic: string): Chat => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Tu es un partenaire de débat intellectuel et bienveillant. 
      Le sujet de la conversation est le suivant : "${initialTopic}".
      
      Ton rôle est de :
      1. Challenger les opinions de l'utilisateur de manière constructive.
      2. Poser des questions socratiques (qui poussent à la réflexion).
      3. Apporter des contre-arguments ou des nuances si l'utilisateur est trop catégorique.
      4. Rester concis (maximum 3-4 phrases par réponse) pour fluidifier le chat.
      5. Toujours rester respectueux mais stimulant.
      
      Ne fais pas de longs monologues. Invite l'utilisateur à répondre.`,
    },
  });
};
