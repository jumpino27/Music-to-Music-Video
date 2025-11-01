
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    // In a real app, you'd want a better way to handle this,
    // but for this environment, we assume it's set.
    console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-pro';

export const generateVideoPrompt = async (
    imageBase64: string,
    imageMimeType: string,
    lyricsChunk: string,
    segmentDuration: number,
    isOutro: boolean = false
): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: imageMimeType,
                data: imageBase64,
            },
        };

        const promptText = isOutro
            ? `You are a video director creating a music video's final outro screen. The segment is very short. The main character is in the provided image. Generate a simple, clear prompt for a text-to-video AI. The goal is to create an engaging outro that encourages viewers to subscribe or follow. Example prompt: "The character from the image smiles warmly at the camera as elegant text animates on screen: 'Thanks for watching! Subscribe' with a small bell icon next to it."`
            : `You are an expert video director creating a concept for a music video. Your task is to generate a detailed and imaginative prompt for a text-to-video AI. This specific video segment will be ${segmentDuration} seconds long.

            The main character/subject is depicted in the provided image.
            The lyrics for this segment are:
            ---
            "${lyricsChunk}"
            ---
            
            Based on the lyrics, the image, and the goal of creating a captivating music video, describe a visually compelling scene. Be extremely detailed in your description to guide the video generation AI.
            
            Include the following elements:
            - **Character Action & Emotion:** What is the character doing? How are they moving? What specific emotions are on their face (e.g., a single tear, a wide joyful grin, a look of determined grit)? Connect their actions directly to the meaning of the lyrics.
            - **Environment & Atmosphere:** Describe the setting in detail. Is it a surreal, dreamlike landscape, a gritty urban alley, or a serene natural location? What is the time of day? What is the weather like? What is the overall mood (e.g., energetic, melancholic, futuristic, nostalgic)?
            - **Camera Work & Cinematography:** Suggest specific camera angles and movements. For example: "A dramatic low-angle shot, slowly pushing in on the character," or "A fast-paced handheld shot following the character as they run."
            - **Lighting:** Describe the lighting style. Is it soft and ethereal, harsh and dramatic with long shadows, or vibrant with neon colors?
            - **Visual & Special Effects:** Suggest any effects to enhance the scene, like slow-motion, lens flares, color grading (e.g., "a desaturated, vintage film look"), or particle effects (e.g., "glowing embers floating in the air").

            Your response should be ONLY the prompt itself, ready to be copied and pasted into a video generation tool. Do not include any extra conversational text or headings like "Here is your prompt:".`;

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: promptText }] },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating prompt with Gemini:", error);
        // Provide a more specific error message if possible
        if (error instanceof Error && error.message.includes('API key')) {
             throw new Error("Invalid API Key. Please ensure your API key is correctly configured.");
        }
        throw new Error("Failed to generate video prompt from AI. Please try again.");
    }
};
