import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import MusicXMLRenderer from "@/components/MusicXMLRenderer";
import RecordingBar from "@/components/RecordingBar";

/**
 * Session Page — Full-screen MusicXML practice session.
 *
 * Flow:
 * 1. Upload a MusicXML file
 * 2. Sheet renders as the main content
 * 3. Start recording → sheet auto-scrolls with cursor at BPM
 * 4. Stop recording → post-recording actions (Rerecord / AI Feedback)
 *
 * TODO: Implement actual audio recording via Web Audio API / MediaRecorder.
 * TODO: Send recorded audio to AI analysis backend.
 */
const SessionPage = () => {
  const navigate = useNavigate();
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
    console.log("MusicXML uploaded:", file.name);
  }, []);

  const handleClearFile = useCallback(() => {
    setUploadedFile(null);
    setXmlContent(null);
    setIsRecording(false);
    setIsPaused(false);
    setHasFinished(false);
  }, []);

  const handleStartRecording = useCallback(() => {
    // TODO: Implement actual audio recording via MediaRecorder
    console.log("Recording started at", bpm, "BPM");
    setIsRecording(true);
    setIsPaused(false);
    setHasFinished(false);
  }, [bpm]);

  const handleStopRecording = useCallback(() => {
    // TODO: Save recorded audio blob
    console.log("Recording stopped");
    setIsRecording(false);
    setIsPaused(false);
    setHasFinished(true);
  }, []);

  const handlePause = useCallback(() => {
    console.log("Recording paused");
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    console.log("Recording resumed");
    setIsPaused(false);
  }, []);

  const handlePlaybackEnd = useCallback(() => {
    // Auto-stop when cursor reaches end of sheet
    console.log("Playback reached end of sheet");
    handleStopRecording();
  }, [handleStopRecording]);

  const handleRerecord = useCallback(() => {
    setHasFinished(false);
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const handleGetFeedback = useCallback(() => {
    // Navigate to feedback page, passing the XML content
    navigate("/feedback", { state: { xmlContent } });
  }, [navigate, xmlContent]);

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

      {/* Main content — grows to fill screen */}
      <main className="flex flex-1 flex-col pb-20">
        {!xmlContent ? (
          /* Upload step */
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
          /* Sheet music display — full width background */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col"
          >
            {/* File info bar */}
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

            {/* Sheet music — takes up all available space */}
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

      {/* Bottom Recording Bar — always visible when file is uploaded */}
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
          disabled={!xmlContent}
          hasFinished={hasFinished}
          onRerecord={handleRerecord}
          onGetFeedback={handleGetFeedback}
        />
      )}
    </div>
  );
};

export default SessionPage;
