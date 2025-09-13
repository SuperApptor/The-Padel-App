
import { GoogleGenAI } from "@google/genai";
import { PlayerProfile } from '../types';

// La clé API pour Gemini doit être placée ici.
const geminiApiKey = 'AIzaSyDHF4a5FHuO5fFomaTTmye_7B8gXw_g5fo';

if (!geminiApiKey) {
  throw new Error("La clé API Gemini n'est pas configurée.");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

export async function generateMatchDescription(profile: PlayerProfile, city: string, levelRange: string, playersNeeded: number): Promise<string> {
  const prompt = `
    Tu es un organisateur de matchs de Padel, connu pour tes annonces courtes, fun et qui donnent envie.
    Crée une annonce de match de Padel courte (2 phrases maximum), percutante et amicale pour le contexte suivant :
    - Organisateur : ${profile.name}, un joueur de niveau ${profile.level.toFixed(1)}.
    - Profil de l'organisateur : ${profile.handedness}, joueur de ${profile.side}.
    - Ville / Club : ${city}
    - Niveaux recherchés : dans la fourchette ${levelRange}
    - Nombre de joueurs recherchés : ${playersNeeded}
    L'annonce doit motiver d'autres joueurs à rejoindre la partie. Sois créatif, utilise l'humour et des références au Padel ou à la ville si possible.
    Ne pas utiliser de markdown, de hashtags, ou de guillemets. Réponds uniquement avec l'annonce.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.85,
        topP: 0.9,
      }
    });
    
    const text = response.text.trim();
    if (!text) {
        throw new Error("La description générée est vide.");
    }

    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    // Fallback description in case of API error
    return `Recherche ${playersNeeded} joueur(s) entre les niveaux ${levelRange} pour un match amical à ${city}. Ambiance garantie !`;
  }
}
