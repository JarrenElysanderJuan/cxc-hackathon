import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import MusicXMLRenderer from "@/components/MusicXMLRenderer";
import RecordingBar from "@/components/RecordingBar";
import { useSessionStore } from "@/store/useSessionStore";
import { audioService } from "@/services/audio";
import { api, AnalyzePayload } from "@/services/api";
import { metronomeService } from "@/services/metronome";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    isAnalyzing,
    setInstrument,
    setSessionDurations
  } = useSessionStore();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [startMeasure, setStartMeasure] = useState(1);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [isCountingIn, setIsCountingIn] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState("Piano");
  const [totalSeconds, setTotalSeconds] = useState(0);

  // Total session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync BPM with Metronome
  useEffect(() => {
    metronomeService.setBpm(bpm);
  }, [bpm]);

  const handleFileUpload = useCallback((file: File, xml: string) => {
    setUploadedFile(file);
    setXmlContent(xml);
    setHasFinished(false);

    // Initialize session in store with selected instrument
    startNewSession(xml, file.name.replace(/\.[^/.]+$/, ""), selectedInstrument);

    console.log("MusicXML uploaded:", file.name);
  }, [startNewSession, selectedInstrument]);

  const handleClearFile = useCallback(() => {
    setUploadedFile(null);
    setXmlContent(null);
    setIsRecording(false);
    setIsPaused(false);
    setHasFinished(false);
    metronomeService.stop();
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      if (isMetronomeOn) {
        setIsCountingIn(true);
        toast.info("Counting in... 4 Beats");
        await metronomeService.playCountIn(4);
        setIsCountingIn(false);
      }

      await audioService.start();
      console.log("Recording started at", bpm, "BPM");

      if (isMetronomeOn) {
        metronomeService.start();
      }

      setIsRecording(true);
      setRecordingStatus(true);
      setIsPaused(false);
      setHasFinished(false);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Could not start recording. Check permissions.");
      setIsCountingIn(false);
    }
  }, [bpm, setRecordingStatus, isMetronomeOn]);

  const handleStopRecording = useCallback(async (recordingElapsed: number) => {
    try {
      metronomeService.stop(); // Stop metronome
      const blob = await audioService.stop();
      console.log("Recording stopped, blob size:", blob.size);

      const { setSessionDurations } = useSessionStore.getState();
      setSessionDurations(recordingElapsed, totalSeconds);
      setRecordingBlob(blob);

      setIsRecording(false);
      setRecordingStatus(false);
      setIsPaused(false);
      setHasFinished(true);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      toast.error("Failed to save recording.");
    }
  }, [setRecordingBlob, setRecordingStatus, totalSeconds]);

  const handlePause = useCallback(() => {
    audioService.pause();
    metronomeService.stop();
    console.log("Recording paused");
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    audioService.resume();
    if (isMetronomeOn) metronomeService.start();
    console.log("Recording resumed");
    setIsPaused(false);
  }, [isMetronomeOn]);

  const handlePlaybackEnd = useCallback(() => {
    console.log("Playback reached end of sheet");
    if (isRecording) {
      // We don't have the exact elapsed here easily, 
      // but usually the RecordingBar will handle the stop.
      // If we auto-stop, we might need to sync the timer.
      handleStopRecording(0);
    }
  }, [isRecording, handleStopRecording]);

  const handleRerecord = useCallback(() => {
    setHasFinished(false);
    setIsRecording(false);
    setIsPaused(false);
    metronomeService.stop();
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

      const payload: AnalyzePayload = {
        Song_name: currentSession.songName,
        Instrument: currentSession.instrument,
        Audio_length: currentSession.durationSeconds || 0,
        Recording: audioBase64,
        Target_XML: currentSession.xmlContent,
        BPM: bpm,
        Starting_measure: startMeasure
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
  }, [currentSession, navigate, setAnalysisResults, setAnalyzingStatus, bpm, startMeasure]);

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
              className="w-full max-w-xl space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Setup Session
                </h2>
                <p className="text-muted-foreground">
                  Select your instrument and upload a MusicXML file to begin.
                </p>
              </div>

              <div className="grid gap-6 p-6 border border-border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Select Instrument
                    </label>
                    <Select
                      value={selectedInstrument}
                      onValueChange={setSelectedInstrument}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Instrument" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Piano">Piano</SelectItem>
                        <SelectItem value="Voice">Voice</SelectItem>
                        <SelectItem value="Guitar">Guitar</SelectItem>
                        <SelectItem value="Violin">Violin</SelectItem>
                        <SelectItem value="Flute">Flute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Upload Sheet Music
                    </label>
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      uploadedFile={uploadedFile}
                      onClear={handleClearFile}
                    />
                  </div>
                </div>
              </div>
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
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {uploadedFile?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50 text-xs font-medium text-muted-foreground">
                    <span>{currentSession?.instrument}</span>
                  </div>
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
                {isCountingIn && (
                  <div className="mb-4 flex items-center justify-center gap-2 rounded-md bg-accent p-2 text-accent-foreground animate-pulse">
                    <span className="text-xl font-bold">Counting In... 4 Beats</span>
                  </div>
                )}
                <MusicXMLRenderer
                  xmlContent={xmlContent}
                  bpm={bpm}
                  isPlaying={isRecording && !isPaused}
                  onPlaybackEnd={handlePlaybackEnd}
                  className="min-h-[60vh]"
                  startMeasure={startMeasure}
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
          disabled={!xmlContent || isAnalyzing || isCountingIn}
          hasFinished={hasFinished}
          onRerecord={handleRerecord}
          onGetFeedback={handleGetFeedback}
          startMeasure={startMeasure}
          onStartMeasureChange={setStartMeasure}
          isMetronomeOn={isMetronomeOn}
          onMetronomeToggle={setIsMetronomeOn}
        />
      )}
    </div>
  );
};

export default SessionPage;
