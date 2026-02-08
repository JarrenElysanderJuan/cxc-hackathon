import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { elevenLabsService } from "@/services/elevenlabs";

interface AIAvatarProps {
  /** Text feedback the avatar "speaks" */
  feedbackText: string;
  /** Whether to auto-start speaking */
  autoSpeak?: boolean;
}

/**
 * Sci-Fi "Cortana-like" AI Avatar.
 * "Lives" in the page as a glowing, pulsating orb.
 * Displays text line-by-line in a "karaoke" style.
 */
const AIAvatar = ({ feedbackText, autoSpeak = true }: AIAvatarProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Split text into sentences for line-by-line display
  const sentences = useMemo(() => {
    return feedbackText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [feedbackText];
  }, [feedbackText]);

  // Fallback for Web Speech API
  const speakWebSpeech = () => {
    if (!("speechSynthesis" in window)) {
      setCurrentSentenceIndex(0); // Show first line
      return;
    }

    window.speechSynthesis.cancel();

    // We can't easily sync sentences with WebSpeech "boundary" events perfectly 
    // without complex logic, so we will just speak the whole thing and 
    // cycle sentences based on estimated time or just show all.
    // simpler: iterate sentences one by one.

    let index = 0;

    const speakNext = () => {
      if (index >= sentences.length) {
        setIsSpeaking(false);
        setCurrentSentenceIndex(-1); // Show nothing or all? Let's show nothing or keep last.
        return;
      }

      setCurrentSentenceIndex(index);
      const utterance = new SpeechSynthesisUtterance(sentences[index]);
      utterance.rate = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        index++;
        speakNext();
      };
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const speak = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    try {
      setIsSpeaking(true);
      setCurrentSentenceIndex(0);

      const audioUrl = await elevenLabsService.speakText(feedbackText);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Calculate approximate duration of each sentence relative to total length
      // This is an estimation since we don't have word-level timestamps from simple MP3
      const totalChars = feedbackText.length;

      const updateSentence = () => {
        if (!audio.paused && !audio.ended) {
          const progress = audio.currentTime / audio.duration;

          // Find which sentence corresponds to this progress fraction
          // Simple linear interpolation based on char count
          let charCount = 0;
          let foundIndex = 0;
          for (let i = 0; i < sentences.length; i++) {
            charCount += sentences[i].length;
            if (progress <= (charCount / totalChars)) {
              foundIndex = i;
              break;
            }
          }
          // Ensure we handle the very end correctly
          if (progress >= 0.99) foundIndex = sentences.length - 1;

          setCurrentSentenceIndex(foundIndex);

          animationFrameRef.current = requestAnimationFrame(updateSentence);
        }
      };

      audio.onplay = () => {
        setIsSpeaking(true);
        updateSentence();
      };
      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentSentenceIndex(-1); // Or keep last? 
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      await audio.play();
    } catch (error) {
      console.warn("ElevenLabs failed, falling back to WebSpeech:", error);
      speakWebSpeech();
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsSpeaking(false);
    setCurrentSentenceIndex(-1);
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
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] relative overflow-hidden">

      {/* Central Orb Container */}
      <div className="relative z-10 flex items-center justify-center cursor-pointer" onClick={speak}>

        {/* Core Orb - Bright & Sharp */}
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-300 via-blue-400 to-purple-500 shadow-[0_0_60px_rgba(34,211,238,0.6)]"
          animate={{
            scale: isSpeaking ? [1, 1.1, 0.95, 1.05, 1] : [1, 1.02, 1],
          }}
          transition={{
            duration: isSpeaking ? 0.4 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Inner Detail - Spinning Light */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white opacity-40 mix-blend-overlay"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Outer Rings (The "Cortana" effect) */}
        <AnimatePresence>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute border-2 border-cyan-400/50 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              style={{ width: 128 + i * 50, height: 128 + i * 50 }}
              animate={{
                rotateX: isSpeaking ? [0, 180, 360] : [0, 360],
                rotateY: [0, 360],
                scale: isSpeaking ? [1, 1.05, 1] : 1,
                opacity: isSpeaking ? 0.8 : 0.3
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Spoken Text Display - Karaoke Style */}
      <div className="mt-16 h-32 w-full max-w-lg px-4 flex flex-col items-center justify-center text-center relative pointer-events-none">
        <AnimatePresence mode="wait">
          {isSpeaking && currentSentenceIndex >= 0 ? (
            <motion.p
              key={currentSentenceIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
              className="text-2xl md:text-3xl font-light text-cyan-50 text-shadow-glow leading-snug drop-shadow-md"
            >
              {sentences[currentSentenceIndex]}
            </motion.p>
          ) : !isSpeaking ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground/50 text-sm uppercase tracking-widest"
            >
              Tap Orb to Replay
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default AIAvatar;
