import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  scrollSpeed: number;
  onScrollSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

const RecordingControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  scrollSpeed,
  onScrollSpeedChange,
  disabled = false,
}: RecordingControlsProps) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isRecording) {
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
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main recording button */}
      <div className="flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          {!isRecording ? (
            <motion.div
              key="start"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Button
                size="lg"
                onClick={onStartRecording}
                disabled={disabled}
                className="h-20 w-20 rounded-full glow-amber transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Mic className="h-8 w-8" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="stop"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={onStopRecording}
                  className="h-20 w-20 rounded-full glow-recording transition-all duration-300 hover:scale-105"
                >
                  <Square className="h-7 w-7" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer */}
        <div className="flex items-center gap-3">
          {isRecording && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-2.5 w-2.5 rounded-full bg-recording-red animate-pulse-recording"
            />
          )}
          <span className="font-mono text-2xl font-medium text-foreground tabular-nums">
            {formatTime(elapsed)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {disabled
            ? "Upload a music sheet to start recording"
            : isRecording
            ? "Recording in progress..."
            : "Tap to start recording"}
        </p>
      </div>

      {/* Scroll speed control */}
      <div className="rounded-lg bg-gradient-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Scroll Speed</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{scrollSpeed}s</span>
        </div>
        <Slider
          value={[scrollSpeed]}
          onValueChange={([val]) => onScrollSpeedChange(val)}
          min={10}
          max={120}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">Fast</span>
          <span className="text-[10px] text-muted-foreground">Slow</span>
        </div>
      </div>

      {/* Reset button */}
      {elapsed > 0 && !isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setElapsed(0)}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset Timer
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default RecordingControls;
