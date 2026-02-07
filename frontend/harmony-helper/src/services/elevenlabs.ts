const API_KEY = import.meta.env.VITE_ELEVENLABS_KEY;
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default generic voice (Rachel)
const BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export const elevenLabsService = {
    /**
     * Converts text to speech using ElevenLabs API.
     * Returns a URL to the audio blob.
     */
    speakText: async (text: string): Promise<string> => {
        if (!API_KEY) {
            console.warn("ElevenLabs API Key not found. Using mock audio.");
            // Return a dummy empty audio or throw to fallback
            throw new Error("Missing API Key");
        }

        try {
            const response = await fetch(`${BASE_URL}/${VOICE_ID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail?.message || "Failed to generate speech");
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error("ElevenLabs Error:", error);
            throw error;
        }
    },
};
