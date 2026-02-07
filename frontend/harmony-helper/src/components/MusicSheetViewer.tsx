import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, ChevronUp, ChevronDown } from "lucide-react";

interface MusicSheetViewerProps {
  sheetUrl: string;
  isScrolling: boolean;
  /** Scroll speed in seconds for one full cycle */
  scrollSpeed: number;
}

const MusicSheetViewer = ({ sheetUrl, isScrolling, scrollSpeed }: MusicSheetViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const animationRef = useRef<number>();

  // Manual scroll with auto-scroll support
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isScrolling) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const pixelsPerFrame = container.scrollHeight / (scrollSpeed * 60);
    let lastTime = performance.now();

    const scroll = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      const px = pixelsPerFrame * (delta / (1000 / 60));
      container.scrollTop += px;
      setScrollPosition(container.scrollTop);

      // Reset at bottom
      if (container.scrollTop >= container.scrollHeight - container.clientHeight - 10) {
        container.scrollTop = 0;
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isScrolling, scrollSpeed]);

  const handleManualScroll = (direction: "up" | "down") => {
    const container = containerRef.current;
    if (!container) return;
    const amount = direction === "up" ? -200 : 200;
    container.scrollBy({ top: amount, behavior: "smooth" });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-card">
      {/* Controls overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/80 backdrop-blur-sm text-foreground transition-colors hover:bg-secondary"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/80 backdrop-blur-sm text-foreground transition-colors hover:bg-secondary"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Manual scroll buttons */}
      {!isScrolling && (
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={() => handleManualScroll("up")}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/80 backdrop-blur-sm text-foreground transition-colors hover:bg-secondary"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleManualScroll("down")}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/80 backdrop-blur-sm text-foreground transition-colors hover:bg-secondary"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Scrolling indicator */}
      {isScrolling && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-recording-red/20 px-3 py-1.5 backdrop-blur-sm"
        >
          <span className="h-2 w-2 rounded-full bg-recording-red animate-pulse-recording" />
          <span className="text-xs font-medium text-foreground">Auto-scrolling</span>
        </motion.div>
      )}

      {/* Sheet music display */}
      <div
        ref={containerRef}
        className="h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin"
        style={{ scrollBehavior: isScrolling ? "auto" : "smooth" }}
      >
        <div
          className="flex items-start justify-center p-6 transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          <img
            src={sheetUrl}
            alt="Music sheet"
            className="max-w-full rounded shadow-lg"
            draggable={false}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-secondary">
        <motion.div
          className="h-full bg-primary"
          style={{
            width: containerRef.current
              ? `${(scrollPosition / (containerRef.current.scrollHeight - containerRef.current.clientHeight)) * 100}%`
              : "0%",
          }}
        />
      </div>
    </div>
  );
};

export default MusicSheetViewer;
