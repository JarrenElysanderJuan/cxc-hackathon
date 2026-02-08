import { useRef, useCallback, useState, useEffect } from "react";
import { OpenSheetMusicDisplay, CursorType } from "opensheetmusicdisplay";

interface UseMusicXMLOptions {
  /** BPM for cursor auto-advance */
  bpm: number;
  /** Whether the cursor should auto-advance */
  isPlaying: boolean;
  /** Called when cursor reaches the end */
  onEnd?: () => void;
}

export function useMusicXML({ bpm, isPlaying, onEnd }: UseMusicXMLOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const timerRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Load MusicXML string into the renderer */
  const loadXML = useCallback(async (xml: string) => {
    if (!containerRef.current) return;
    setError(null);
    setIsLoaded(false);

    try {
      // Clean up previous instance
      if (osmdRef.current) {
        osmdRef.current.clear();
      }

      const osmd = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        drawTitle: false,
        drawComposer: false,
        drawCredits: false,
        drawPartNames: false,
        drawPartAbbreviations: false,
        drawingParameters: "compact",
        backend: "svg",
        cursorsOptions: [
          {
            type: CursorType.Standard as number,
            color: "#e8a838",
            alpha: 0.5,
            follow: true,
          },
        ],
      });

      await osmd.load(xml);
      osmd.render();
      osmd.cursor.show();


      osmdRef.current = osmd;
      setIsLoaded(true);
    } catch (err) {
      console.error("OSMD load error:", err);
      setError("Failed to parse MusicXML. Please check the file format.");
    }
  }, []);



  /** Advance cursor by one step */
  const nextNote = useCallback(() => {
    if (!osmdRef.current) return false;
    const cursor = osmdRef.current.cursor;
    if (cursor.iterator.EndReached) {
      return false; // end of sheet
    }
    cursor.next();
    return !cursor.iterator.EndReached;
  }, []);

  /** Auto-advance cursor based on BPM */
  useEffect(() => {
    if (!isPlaying || !isLoaded) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // ms per beat = 60000 / bpm
    const msPerBeat = 60000 / bpm;

    timerRef.current = window.setInterval(() => {
      const hasMore = nextNote();
      if (!hasMore) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        onEnd?.();
      }
    }, msPerBeat);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isLoaded, bpm, nextNote, onEnd]);

  /**
   * Highlight specific notes with error colors.
   */
  const highlightErrors = useCallback(
    (errors: Array<{ measure: number; noteIndex: number; severity: string }>) => {
      if (!osmdRef.current) return;

      const osmd = osmdRef.current;

      errors.forEach((err) => {
        try {
          const measureList = osmd.GraphicSheet.MeasureList;
          if (err.measure - 1 < measureList.length) {
            const staffEntries =
              measureList[err.measure - 1]?.[0]?.staffEntries;
            if (staffEntries && err.noteIndex < staffEntries.length) {
              const graphicalNotes =
                staffEntries[err.noteIndex]?.graphicalVoiceEntries?.[0]
                  ?.notes;
              if (graphicalNotes) {
                graphicalNotes.forEach((gNote: any) => {
                  const svgEl = gNote.getSVGGElement?.();
                  if (svgEl) {
                    const color =
                      err.severity === "major"
                        ? "#ef4444"
                        : err.severity === "moderate"
                          ? "#f59e0b"
                          : "#3b82f6";
                    svgEl.querySelectorAll("*").forEach((el: SVGElement) => {
                      el.style.fill = color;
                      el.style.stroke = color;
                    });
                  }
                });
              }
            }
          }
        } catch (e) {
          console.warn("Error highlighting note:", e);
        }
      });
    },
    []
  );

  /** Jump cursor to specific measure (1-indexed) */
  const jumpToMeasure = useCallback((measureNumber: number) => {
    if (!osmdRef.current) return;
    const cursor = osmdRef.current.cursor;
    cursor.reset();

    // OSMD is 0-indexed for measure index
    const targetIndex = measureNumber - 1;

    // Fast forward
    while (cursor.iterator.CurrentMeasureIndex < targetIndex && !cursor.iterator.EndReached) {
      cursor.next();
    }

    cursor.show();
  }, []);

  /** Reset cursor to start (or startMeasure) */
  const resetCursor = useCallback((startMeasure: number = 1) => {
    if (!osmdRef.current) return;
    if (startMeasure > 1) {
      jumpToMeasure(startMeasure);
    } else {
      osmdRef.current.cursor.reset();
      osmdRef.current.cursor.show();
    }
  }, [jumpToMeasure]);

  return {
    containerRef,
    isLoaded,
    error,
    loadXML,
    resetCursor,
    jumpToMeasure,
    nextNote,
    highlightErrors,
    osmd: osmdRef,
  };
}
