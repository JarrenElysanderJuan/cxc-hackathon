import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import MusicXMLRenderer from "@/components/MusicXMLRenderer";
import RecordingBar from "@/components/RecordingBar";
import { useSessionStore } from "@/store/useSessionStore";
import { audioService } from "@/services/audio";
import { api } from "@/services/api";
import { toast } from "sonner";
import { AnalysisResponse } from "@/types";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const SessionPage = () => {
  const navigate = useNavigate();
  const {
    startNewSession,
    setRecordingBlob,
    currentSession,
    setAnalysisResults,
    setRecordingStatus,
    setAnalyzingStatus,
    isAnalyzing
  } = useSessionStore();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [bpm, setBpm] = useState(120);

  const handleFileUpload = useCallback((file: File, xml: string) => {
    setUploadedFile(file);
    setXmlContent(xml);
    setHasFinished(false);

    // Initialize session in store
    startNewSession(xml, file.name.replace(/\.[^/.]+$/, ""), "Piano"); // Default instrument for now

    console.log("MusicXML uploaded:", file.name);
  }, [startNewSession]);

  const handleClearFile = useCallback(() => {
    setUploadedFile(null);
    setXmlContent(null);
    setIsRecording(false);
    setIsPaused(false);
    setHasFinished(false);
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      await audioService.start();
      console.log("Recording started at", bpm, "BPM");
      setIsRecording(true);
      setRecordingStatus(true);
      setIsPaused(false);
      setHasFinished(false);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Could not start recording. Check permissions.");
    }
  }, [bpm, setRecordingStatus]);

  const handleStopRecording = useCallback(async () => {
    try {
      const blob = await audioService.stop();
      console.log("Recording stopped, blob size:", blob.size);
      setRecordingBlob(blob);

      setIsRecording(false);
      setRecordingStatus(false);
      setIsPaused(false);
      setHasFinished(true);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to save recording.");
    }
  }, [setRecordingBlob, setRecordingStatus]);

  const handlePause = useCallback(() => {
    audioService.pause();
    console.log("Recording paused");
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    audioService.resume();
    console.log("Recording resumed");
    setIsPaused(false);
  }, []);

  const handlePlaybackEnd = useCallback(() => {
    console.log("Playback reached end of sheet");
    if (isRecording) {
      handleStopRecording();
    }
  }, [isRecording, handleStopRecording]);

  const handleRerecord = useCallback(() => {
    setHasFinished(false);
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const handleGetFeedback = useCallback(async () => {
    if (!currentSession?.audioBlob || !currentSession?.xmlContent) {
      toast.error("No recording found.");
      return;
    }

    try {
      setAnalyzingStatus(true);
      toast.info("Analyzing performance...");

      const audioBase64 = await blobToBase64(currentSession.audioBlob);

      const payload = {
        Song_name: currentSession.songName,
        Instrument: currentSession.instrument,
        Audio_length: currentSession.durationSeconds || 0, // TODO: track actual duration
        Recording: audioBase64,
        Target_XML: currentSession.xmlContent
      };

      const results = await api.analyze(payload);
      setAnalysisResults(results);

      toast.success("Analysis complete!");
      navigate("/feedback");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzingStatus(false);
    }
  }, [currentSession, navigate, setAnalysisResults, setAnalyzingStatus]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-studio">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Practice Session</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col pb-20 relative">
        {isAnalyzing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium text-foreground">Analyzing your performance...</p>
            </div>
          </div>
        )}

        {!xmlContent ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl"
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  1
                </span>
                <h2 className="text-lg font-semibold text-foreground">
                  Upload MusicXML Sheet
                </h2>
              </div>
              <FileUpload
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                onClear={handleClearFile}
              />
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col"
          >
            <div className="border-b border-border bg-card/50 px-4 py-2">
              <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {uploadedFile?.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFile}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Change file
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-card/30 p-4">
              <div className="mx-auto max-w-5xl">
                <MusicXMLRenderer
                  xmlContent={xmlContent}
                  bpm={bpm}
                  isPlaying={isRecording && !isPaused}
                  onPlaybackEnd={handlePlaybackEnd}
                  className="min-h-[60vh]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {xmlContent && (
        <RecordingBar
          isRecording={isRecording}
          isPaused={isPaused}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
          onPause={handlePause}
          onResume={handleResume}
          bpm={bpm}
          onBpmChange={setBpm}
          disabled={!xmlContent || isAnalyzing}
          hasFinished={hasFinished}
          onRerecord={handleRerecord}
          onGetFeedback={handleGetFeedback}
        />
      )}
    </div>
  );
};

export default SessionPage;
