import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, Mic, ArrowRight, Activity, Calendar, Flame, Clock, History, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserStats } from "@/components/UserStats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSessionStore } from "@/store/useSessionStore";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { streak, history } = useSessionStore();

  const recentSessions = history.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-studio flex flex-col">
      {/* Auth Header */}
      <div className="absolute top-0 right-0 z-50 p-4 flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 bg-background/20 backdrop-blur-sm p-2 rounded-full border border-white/10">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white hidden sm:block">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        ) : (
          !isLoading && <LoginButton />
        )}
      </div>

      {isAuthenticated ? (
        /* ==================== AUTHENTICATED USER VIEW ==================== */
        <div className="flex-1 flex flex-col pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Ready to continue your musical journey?
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 pb-12">
            {/* LEFT COLUMN: Stats & Sidebar Area */}
            <div className="lg:col-span-7 space-y-6">
              {/* User Stats Graph */}
              <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm p-1">
                {/* Reusing existing UserStats, forcing it to fit container */}
                <div className="[&>div]:mt-0 [&>div]:px-0">
                  <UserStats />
                </div>
              </div>

              {/* Gamification & History Module */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Streak Card */}
                <Card className="bg-card/30 backdrop-blur-sm border-white/10 col-span-1 flex flex-col justify-center items-center p-4">
                  <div className="bg-orange-500/20 p-3 rounded-full mb-2 glow-amber-sm">
                    <Flame className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-white block">{streak}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Day Streak</span>
                  </div>
                </Card>

                {/* Recent Sessions List */}
                <Card className="bg-card/30 backdrop-blur-sm border-white/10 col-span-1 sm:col-span-2 relative overflow-hidden">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                      <span>Recent Practice</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-primary" onClick={() => navigate('/history')}>
                        View All <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {recentSessions.length > 0 ? (
                      <div className="space-y-2">
                        {recentSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group cursor-pointer" onClick={() => navigate('/history')}>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                <Music className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate text-white">{session.songName || "Untitled"}</span>
                                <span className="text-xs text-muted-foreground truncate">{session.instrument} • {new Date(session.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50">
                        <History className="h-8 w-8 mb-2 opacity-20" />
                        <span className="text-xs">No sessions yet</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* RIGHT COLUMN: Session Start */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="h-full"
              >
                <Card className="h-full bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 flex flex-col justify-center items-center text-center p-8 glow-amber transition-all hover:scale-[1.01]">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 glow-amber-sm">
                    <Mic className="h-10 w-10 text-primary" />
                  </div>
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-3xl font-bold">Start Practice Session</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      Upload sheet music, record performance, and get AI feedback.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 w-full max-w-xs">
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20"
                      onClick={() => navigate("/session")}
                    >
                      Start Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== GUEST LANDING VIEW ==================== */
        <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden px-4 min-h-screen">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <img
              src={heroBg}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex max-w-3xl flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-amber-sm"
            >
              <Music className="h-8 w-8 text-primary" />
            </motion.div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Practice with{" "}
              <span className="text-gradient-amber">Precision</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
              Upload your sheet music, record your performance, and get
              AI&#8209;powered feedback to perfect your craft.
            </p>

            <div className="mt-10 mb-12">
              <LoginButton className="h-14 px-10 text-lg font-semibold glow-amber transition-all duration-300 hover:scale-105" variant="default">
                Start Your Journey
              </LoginButton>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
