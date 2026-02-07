import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAvatarProps {
  /** Text feedback the avatar "speaks" */
  feedbackText: string;
  /** Whether to auto-start speaking */
  autoSpeak?: boolean;
}

/**
 * AI Avatar component that displays a circular avatar and
 * "speaks" feedback using the Web Speech API (text-to-speech).
 *
 * TODO: Replace with actual AI voice synthesis (e.g., ElevenLabs)
 * when backend integration is ready.
 */
const AIAvatar = ({ feedbackText, autoSpeak = true }: AIAvatarProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const charIndexRef = useRef(0);

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      console.log("TTS not supported — displaying text only.");
      setDisplayedText(feedbackText);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(feedbackText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utteranceRef.current = utterance;

    // Animate text reveal in sync with speech
    setDisplayedText("");
    charIndexRef.current = 0;

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
    utterance.onerror = () => {
      setIsSpeaking(false);
      setDisplayedText(feedbackText);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setDisplayedText(feedbackText);
  };

  useEffect(() => {
    if (autoSpeak && feedbackText) {
      // Small delay so the page renders first
      const timeout = setTimeout(speak, 800);
      return () => {
        clearTimeout(timeout);
        window.speechSynthesis.cancel();
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
          onClick={isSpeaking ? stopSpeaking : speak}
        >
          {isSpeaking ? (
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
