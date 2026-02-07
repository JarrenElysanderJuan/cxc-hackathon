import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingBarProps {
  isRecording: boolean;
  isPaused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  disabled?: boolean;
  /** Show post-recording actions */
  hasFinished: boolean;
  onRerecord: () => void;
  onGetFeedback: () => void;
}

const RecordingBar = ({
  isRecording,
  isPaused,
  onStart,
  onStop,
  onPause,
  onResume,
  bpm,
  onBpmChange,
  disabled = false,
  hasFinished,
  onRerecord,
  onGetFeedback,
}: RecordingBarProps) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isRecording && !isPaused) {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Left: BPM Control */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            BPM
          </label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val >= 20 && val <= 300) onBpmChange(val);
            }}
            min={20}
            max={300}
            className="w-16 rounded-md border border-border bg-secondary px-2 py-1.5 text-center font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={isRecording}
          />
        </div>

        {/* Center: Recording Controls */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {hasFinished && !isRecording ? (
              /* Post-recording actions */
              <motion.div
                key="post"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRerecord}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Rerecord
                </Button>
                <Button
                  size="sm"
                  onClick={onGetFeedback}
                  className="gap-2 glow-amber"
                >
                  AI Feedback
                </Button>
              </motion.div>
            ) : !isRecording ? (
              /* Start button */
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  size="lg"
                  onClick={onStart}
                  disabled={disabled}
                  className="h-12 w-12 rounded-full glow-amber p-0 disabled:opacity-40"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </motion.div>
            ) : (
              /* Recording controls */
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={isPaused ? onResume : onPause}
                  className="h-10 w-10 rounded-full"
                >
                  {isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </Button>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={onStop}
                    className="h-12 w-12 rounded-full glow-recording"
                  >
                    <Square className="h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Timer + Recording indicator */}
        <div className="flex items-center gap-3 min-w-[100px] justify-end">
          {isRecording && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-2.5 w-2.5 rounded-full bg-recording-red animate-pulse-recording"
            />
          )}
          <span className="font-mono text-lg font-medium text-foreground tabular-nums">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Optional progress indicator */}
      {isRecording && (
        <div className="h-0.5 w-full bg-secondary">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 120,
              ease: "linear",
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default RecordingBar;
