import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { elevenLabsService } from "@/services/elevenlabs";

interface AIAvatarProps {
  /** Text feedback the avatar "speaks" */
  feedbackText: string;
  /** Whether to auto-start speaking */
  autoSpeak?: boolean;
}

/**
 * AI Avatar component that displays a circular avatar and
 * "speaks" feedback using ElevenLabs or Web Speech API fallback.
 */
const AIAvatar = ({ feedbackText, autoSpeak = true }: AIAvatarProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakWebSpeech = () => {
    if (!("speechSynthesis" in window)) {
      setDisplayedText(feedbackText);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(feedbackText);
    utterance.rate = 1;

    // Word-by-word reveal for WebSpeech
    setDisplayedText("");

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        setDisplayedText(feedbackText.slice(0, event.charIndex + event.charLength));
      }
    };

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setDisplayedText(feedbackText);
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const speak = async () => {
    // If already speaking, stop
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    try {
      setIsLoading(true);
      // Attempt ElevenLabs
      const audioUrl = await elevenLabsService.speakText(feedbackText);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        console.error("Audio playback error");
        setIsSpeaking(false);
      };

      await audio.play();
      setDisplayedText(feedbackText); // Show full text immediately for audio
    } catch (error) {
      console.warn("ElevenLabs failed, falling back to WebSpeech:", error);
      speakWebSpeech();
    } finally {
      setIsLoading(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setDisplayedText(feedbackText);
  };

  useEffect(() => {
    if (autoSpeak && feedbackText) {
      const timeout = setTimeout(speak, 800);
      return () => {
        clearTimeout(timeout);
        stopSpeaking();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackText, autoSpeak]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular Avatar */}
      <motion.div
        className="relative"
        animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
          <span className="text-3xl">🎵</span>
        </div>
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </motion.div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">AI Coach</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={speak}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isSpeaking ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Spoken text display */}
      <div className="max-h-40 overflow-y-auto rounded-lg bg-secondary/50 p-3">
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {displayedText || (
            <span className="italic opacity-50">Preparing feedback…</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AIAvatar;
