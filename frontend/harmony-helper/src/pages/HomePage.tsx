import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, Mic, FileMusic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "@/components/auth/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserStats } from "@/components/UserStats";

const features = [
  {
    icon: FileMusic,
    title: "Upload Sheet Music",
    description: "Import your PDF or image music sheets to practice along.",
  },
  {
    icon: Mic,
    title: "Record & Play",
    description: "Record your performance while the sheet scrolls in sync.",
  },
  {
    icon: Sparkles,
    title: "AI Feedback",
    description: "Get intelligent analysis of your practice sessions.",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-studio">
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

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4">
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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 mb-12"
          >
            <Button
              size="lg"
              onClick={() => navigate("/session")}
              className="h-14 px-10 text-lg font-semibold glow-amber transition-all duration-300 hover:scale-105"
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Session
            </Button>
          </motion.div>

          {isAuthenticated && <UserStats />}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs tracking-widest uppercase">Discover</span>
            <div className="h-6 w-px bg-muted-foreground/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 pb-24">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group flex flex-col items-center rounded-xl bg-gradient-card border border-border p-8 text-center transition-all duration-300 hover:border-primary/30 hover:glow-amber-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
