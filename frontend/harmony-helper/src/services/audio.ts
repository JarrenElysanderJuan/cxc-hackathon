export const audioService = {
    mediaRecorder: null as MediaRecorder | null,
    audioChunks: [] as Blob[],

    start: async (): Promise<void> => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Audio recording not supported");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 44100,
                echoCancellation: false,
                autoGainControl: false,
                noiseSuppression: false,
                channelCount: 1
            }
        });

        // Use proper mime type
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/mp4";

        const recorder = new MediaRecorder(stream, { mimeType });
        audioService.mediaRecorder = recorder;
        audioService.audioChunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioService.audioChunks.push(event.data);
            }
        };

        recorder.start();
    },

    stop: (): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const recorder = audioService.mediaRecorder;
            if (!recorder) {
                return reject(new Error("No active recorder"));
            }

            recorder.onstop = () => {
                const mimeType = recorder.mimeType;
                const blob = new Blob(audioService.audioChunks, { type: mimeType });
                audioService.audioChunks = [];
                audioService.mediaRecorder = null;

                // Stop all tracks
                recorder.stream.getTracks().forEach(track => track.stop());

                resolve(blob);
            };

            recorder.stop();
        });
    },

    pause: () => {
        if (audioService.mediaRecorder && audioService.mediaRecorder.state === "recording") {
            audioService.mediaRecorder.pause();
        }
    },

    resume: () => {
        if (audioService.mediaRecorder && audioService.mediaRecorder.state === "paused") {
            audioService.mediaRecorder.resume();
        }
    },
};
