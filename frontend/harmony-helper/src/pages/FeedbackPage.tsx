import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, BarChart3, Target, Gauge, Music2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MusicXMLRenderer from "@/components/MusicXMLRenderer";
import AIAvatar from "@/components/AIAvatar";
import { useSessionStore } from "@/store/useSessionStore";
import { DUMMY_MUSICXML } from "@/lib/dummyMusicXML";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { currentSession, clearSession } = useSessionStore();

  const analysis = currentSession?.analysis;

  useEffect(() => {
    if (!currentSession) {
      // If no session, redirect to home or session
      // navigate("/session");
    }
  }, [currentSession, navigate]);

  // Fallback to dummy if no analysis (for dev/preview)
  // In production, we might want to force a redirect
  const xmlContent = analysis?.["marked-up-musicxml"] || currentSession?.xmlContent || DUMMY_MUSICXML;
  const summary = analysis?.["performace_summary"] || "No analysis available.";
  const detailedFeedback = analysis?.["coach-feedback"] || "Practice more!";

  // Spectrograms (Base64 or URL)
  const userSpectrogram = analysis?.["user-spectrogram"];
  const targetSpectrogram = analysis?.["target-spectrogram"];

  const handleNewSession = () => {
    clearSession();
    navigate("/session");
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
            onClick={handleNewSession}
            className="gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Session
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Spectrogram Comparison */}
            {(userSpectrogram || targetSpectrogram) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {targetSpectrogram && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Target className="h-4 w-4" /> Target Spectrogram
                    </h3>
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-black/20">
                      {targetSpectrogram.startsWith("data:") || targetSpectrogram.startsWith("http") ? (
                        <img src={targetSpectrogram} alt="Target Spectrogram" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          {targetSpectrogram}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {userSpectrogram && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" /> Your Spectrogram
                    </h3>
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-black/20">
                      {userSpectrogram.startsWith("data:") || userSpectrogram.startsWith("http") ? (
                        <img src={userSpectrogram} alt="User Spectrogram" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          {userSpectrogram}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Marked-up sheet */}
            <div className="rounded-lg border border-border bg-card p-4 overflow-auto min-h-[400px]">
              <h3 className="mb-4 text-lg font-semibold">Performance Analysis</h3>
              <MusicXMLRenderer
                xmlContent={xmlContent}
                bpm={120}
                isPlaying={false}
                errors={[]} // TODO: Parse errors from marked-up XML if possible, or expect backend to markup visual elements directly
                className="min-h-[400px]"
              />
            </div>

            {/* Detailed Feedback Text */}
            <div className="rounded-lg bg-gradient-card border border-border p-6">
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                Coach's Detailed Notes
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {detailedFeedback}
              </p>
            </div>
          </motion.div>

          {/* Right Sidebar: AI Avatar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-20 lg:self-start space-y-6"
          >
            <div className="rounded-xl bg-gradient-card border border-border p-6 shadow-sm">
              <h3 className="mb-4 text-center font-semibold text-muted-foreground uppercase tracking-widest text-xs">
                AI Vocal Coach
              </h3>
              <AIAvatar feedbackText={summary} autoSpeak={true} />
            </div>

            {/* Stats Summary (Mock) */}
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <h4 className="mb-3 text-sm font-medium">Session Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-mono">
                    {Math.floor((currentSession?.durationSeconds || 0) / 60)}:
                    {((currentSession?.durationSeconds || 0) % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Instrument</span>
                  <span>{currentSession?.instrument || "Voice"}</span>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
