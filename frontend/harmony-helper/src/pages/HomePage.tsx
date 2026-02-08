import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, Mic, ArrowRight, Activity, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserStats } from "@/components/UserStats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();

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

              {/* Placeholder for future sidebar/modules */}
              <div className="rounded-xl border border-border bg-card/30 p-6 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground border-dashed">
                <Activity className="h-10 w-10 mb-3 opacity-20" />
                <p>Recent Activity & Achievements coming soon...</p>
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
