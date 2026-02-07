import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, BarChart3, Target, Gauge, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MusicXMLRenderer from "@/components/MusicXMLRenderer";
import AIAvatar from "@/components/AIAvatar";
import {
  DUMMY_MUSICXML,
  DUMMY_ERRORS,
  DUMMY_FEEDBACK_TEXT,
} from "@/lib/dummyMusicXML";

/**
 * AI Feedback Page
 *
 * Displays the MusicXML sheet marked up with errors,
 * alongside an AI avatar that "speaks" the feedback.
 *
 * TODO: Replace dummy data with actual backend AI analysis results.
 * TODO: Integrate real audio analysis API for pitch/tempo detection.
 * TODO: Add interactive error navigation (click error → jump to note).
 */
const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get XML from navigation state, or fall back to dummy
  const xmlContent =
    (location.state as { xmlContent?: string })?.xmlContent || DUMMY_MUSICXML;

  const feedback = DUMMY_FEEDBACK_TEXT;
  const errors = DUMMY_ERRORS;

  const scoreColor = (score: number) => {
    if (score >= 85) return "text-success-green";
    if (score >= 60) return "text-primary";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-studio">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/session")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Session
          </Button>
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">AI Feedback</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/session")}
            className="gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Session
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Left: Sheet music with error highlights (takes most space) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Score summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Overall",
                  value: feedback.overallScore,
                  icon: BarChart3,
                },
                {
                  label: "Pitch",
                  value: feedback.pitchAccuracy,
                  icon: Target,
                },
                {
                  label: "Tempo",
                  value: feedback.tempoConsistency,
                  icon: Gauge,
                },
                {
                  label: "Dynamics",
                  value: feedback.dynamics,
                  icon: Music2,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-gradient-card border border-border p-4 text-center"
                >
                  <stat.icon className="mx-auto mb-1.5 h-4 w-4 text-muted-foreground" />
                  <p
                    className={`text-2xl font-bold tabular-nums ${scoreColor(stat.value)}`}
                  >
                    {stat.value}%
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Marked-up sheet */}
            <div className="rounded-lg border border-border bg-card p-4 overflow-auto">
              <MusicXMLRenderer
                xmlContent={xmlContent}
                bpm={120}
                isPlaying={false}
                errors={errors}
                className="min-h-[400px]"
              />
            </div>

            {/* Error legend */}
            <div className="flex flex-wrap items-center gap-4 rounded-lg bg-secondary/50 px-4 py-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Error Legend:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">
                  Major (pitch)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">
                  Moderate (pitch)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-accent" />
                <span className="text-xs text-muted-foreground">
                  Minor (timing/dynamics)
                </span>
              </div>
            </div>

            {/* Textual feedback */}
            <div className="rounded-lg bg-gradient-card border border-border p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Detailed Notes
              </h3>
              <ul className="space-y-2">
                {errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        err.severity === "major"
                          ? "bg-destructive"
                          : err.severity === "moderate"
                          ? "bg-primary"
                          : "bg-accent"
                      }`}
                    />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">
                        Measure {err.measure}, Note {err.noteIndex + 1}:
                      </strong>{" "}
                      {err.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice tips */}
            <div className="rounded-lg bg-gradient-card border border-border p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Practice Tips
              </h3>
              <ol className="space-y-2 list-decimal list-inside">
                {feedback.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {tip}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>

          {/* Right sidebar: AI Avatar (does not block the sheet) */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-20 lg:self-start"
          >
            <div className="rounded-xl bg-gradient-card border border-border p-5">
              <AIAvatar feedbackText={feedback.summary} autoSpeak={true} />
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
