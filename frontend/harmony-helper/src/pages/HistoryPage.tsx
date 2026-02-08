
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Music, Play, FileText, Download, Trash2, StopCircle, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/useSessionStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef } from "react";
import { toast } from "sonner";

// Helper to download string as file
const downloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

// Helper to play base64 audio
const playBase64Audio = (base64: string, onEnded: () => void) => {
    const audio = new Audio(base64);
    audio.onended = onEnded;
    audio.play();
    return audio;
};

const HistoryPage = () => {
    const navigate = useNavigate();
    const { history, deleteSession } = useSessionStore();
    const [playingSessionId, setPlayingSessionId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlay = (sessionId: string, audioBase64?: string) => {
        if (playingSessionId === sessionId) {
            // Stop
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setPlayingSessionId(null);
            return;
        }

        if (!audioBase64) {
            toast.error("No recording available for this session.");
            return;
        }

        // Stop current if any
        if (audioRef.current) {
            audioRef.current.pause();
        }

        try {
            const audio = new Audio(audioBase64);
            audioRef.current = audio;
            audio.onended = () => setPlayingSessionId(null);
            audio.play().catch(e => {
                console.error("Playback error:", e);
                toast.error("Could not play audio.");
                setPlayingSessionId(null);
            });
            setPlayingSessionId(sessionId);
        } catch (e) {
            toast.error("Error decoding audio.");
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this session?")) {
            deleteSession(id);
            toast.success("Session deleted.");
        }
    };

    const handleDownloadXml = (e: React.MouseEvent, content: string, name: string) => {
        e.stopPropagation();
        downloadFile(`${name.replace(/\s+/g, '_')}.musicxml`, content);
        toast.success("Sheet music downloaded.");
    };

    return (
        <div className="min-h-screen bg-gradient-studio flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
                <div className="flex h-16 items-center px-4 sm:px-8 max-w-7xl mx-auto w-full gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Practice History</h1>
                        <p className="text-xs text-muted-foreground">Your journey so far</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto w-full">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center text-muted-foreground">
                        <HistoryIcon className="h-16 w-16 mb-4 opacity-20" />
                        <h2 className="text-xl font-semibold mb-2">No History Yet</h2>
                        <p className="max-w-md mb-8">Start your first practice session to begin tracking your progress.</p>
                        <Button onClick={() => navigate('/session')} size="lg" className="glow-amber">
                            Start Session
                        </Button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-4"
                    >
                        {history.map((session) => (
                            <Card key={session.id} className="bg-card/40 backdrop-blur-sm border-white/10 overflow-hidden hover:bg-card/60 transition-colors">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-6">
                                        {/* Icon/Date */}
                                        <div className="flex items-center gap-4 min-w-[180px]">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                                <Music className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white truncate max-w-[200px]">{session.songName || "Untitled"}</h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(session.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex-1 flex flex-wrap gap-4 sm:gap-8 items-center text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5">
                                                    {session.instrument}
                                                </div>
                                            </div>
                                            {session.analysis && (
                                                <div className="text-green-400 text-xs font-medium px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                                                    Feedback Available
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-2 sm:mt-0 justify-end w-full sm:w-auto">
                                            <Button
                                                variant={playingSessionId === session.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePlay(session.id, (session as any).audioBase64)}
                                                disabled={!(session as any).audioBase64}
                                                className={playingSessionId === session.id ? "bg-red-500 hover:bg-red-600 text-white border-none" : "border-white/10"}
                                            >
                                                {playingSessionId === session.id ? (
                                                    <>
                                                        <StopCircle className="h-4 w-4 mr-2" /> Stop
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-4 w-4 mr-2" /> Play
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="border-white/10"
                                                title="Download MusicXML"
                                                onClick={(e) => handleDownloadXml(e, session.xmlContent, session.songName)}
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => handleDelete(e, session.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default HistoryPage;
