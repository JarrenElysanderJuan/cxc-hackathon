import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useMusicXML } from "@/hooks/useMusicXML";
import type { NoteError } from "@/lib/dummyMusicXML";

interface MusicXMLRendererProps {
  /** Raw MusicXML string */
  xmlContent: string;
  /** Beats per minute for auto-scroll */
  bpm: number;
  /** Whether cursor should auto-advance */
  isPlaying: boolean;
  /** Called when playback reaches end of sheet */
  onPlaybackEnd?: () => void;
  /** Optional error highlights */
  errors?: NoteError[];
  /** Extra CSS class for the container */
  className?: string;
}

const MusicXMLRenderer = ({
  xmlContent,
  bpm,
  isPlaying,
  onPlaybackEnd,
  errors,
  className = "",
}: MusicXMLRendererProps) => {
  const {
    containerRef,
    isLoaded,
    error,
    loadXML,
    resetCursor,
    highlightErrors,
  } = useMusicXML({
    bpm,
    isPlaying,
    onEnd: onPlaybackEnd,
  });

  // Load XML when content changes
  useEffect(() => {
    if (xmlContent) {
      loadXML(xmlContent);
    }
  }, [xmlContent, loadXML]);

  // Apply error highlights after loading
  useEffect(() => {
    if (isLoaded && errors && errors.length > 0) {
      // Small delay to ensure SVG is rendered
      const timeout = setTimeout(() => {
        highlightErrors(errors);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoaded, errors, highlightErrors]);

  // Reset cursor when isPlaying transitions to true
  useEffect(() => {
    if (isPlaying && isLoaded) {
      resetCursor();
    }
  }, [isPlaying, isLoaded, resetCursor]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {!isLoaded && xmlContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/80"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Rendering sheet music…
            </span>
          </div>
        </motion.div>
      )}

      {/* OSMD renders into this div */}
      <div
        ref={containerRef}
        className="
          w-full overflow-auto
          [&_svg]:max-w-full
          [&_svg_*]:fill-zinc-200
          [&_svg_*]:stroke-zinc-200
          [&_svg]:bg-transparent
        "
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default MusicXMLRenderer;
