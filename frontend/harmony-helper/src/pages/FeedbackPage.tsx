import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, BarChart3, Target, Music2, FileText, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
            {/* Central Content with Tabs (Sheet vs Summary) */}
            <div className="rounded-lg border border-border bg-card overflow-hidden min-h-[500px] flex flex-col">
              <Tabs defaultValue="sheet" className="w-full flex-1 flex flex-col">
                <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Performance Review</h3>
                  <TabsList className="grid w-[240px] grid-cols-2">
                    <TabsTrigger value="sheet" className="gap-2">
                      <Music className="h-3.5 w-3.5" /> Sheet Music
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="gap-2">
                      <FileText className="h-3.5 w-3.5" /> Summary
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 p-4 bg-card">
                  <TabsContent value="sheet" className="mt-0 h-full">
                    <MusicXMLRenderer
                      xmlContent={xmlContent}
                      bpm={120}
                      isPlaying={false}
                      errors={[]}
                      className="min-h-[400px]"
                    />
                  </TabsContent>

                  <TabsContent value="summary" className="mt-0 h-full">
                    <div className="prose prose-invert max-w-none">
                      <h3 className="text-xl font-semibold mb-4 text-primary">Performance Summary</h3>
                      <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {summary}
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

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
          </motion.div>

          {/* Right Sidebar: AI Avatar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24 h-[calc(100vh-8rem)] flex flex-col justify-center"
          >
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Avatar speaks the 'coach-feedback' (detailed/short actionable) */}
              <AIAvatar feedbackText={detailedFeedback} autoSpeak={true} />
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
