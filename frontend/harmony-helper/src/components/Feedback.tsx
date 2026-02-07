import { motion } from "framer-motion";
import { Brain, Sparkles, BarChart3 } from "lucide-react";

/**
 * Feedback component - Placeholder for future AI-powered feedback analysis.
 *
 * TODO: Integrate AI feedback here. Possible features:
 * - Pitch accuracy analysis
 * - Tempo consistency check
 * - Note-by-note comparison with sheet music
 * - Overall performance score
 * - Practice suggestions and tips
 */

interface FeedbackProps {
  hasRecording: boolean;
}

const Feedback = ({ hasRecording }: FeedbackProps) => {
  if (!hasRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-lg bg-gradient-card border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">AI Feedback</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
          Coming Soon
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pitch accuracy placeholder */}
        <div className="flex flex-col items-center gap-2 rounded-md bg-secondary/50 p-4">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Pitch Accuracy</span>
          <span className="text-xs text-muted-foreground">Analysis pending</span>
        </div>

        {/* Tempo placeholder */}
        <div className="flex flex-col items-center gap-2 rounded-md bg-secondary/50 p-4">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Tempo</span>
          <span className="text-xs text-muted-foreground">Analysis pending</span>
        </div>

        {/* Overall score placeholder */}
        <div className="flex flex-col items-center gap-2 rounded-md bg-secondary/50 p-4">
          <Brain className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Overall Score</span>
          <span className="text-xs text-muted-foreground">Analysis pending</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {/* TODO: Replace with actual AI feedback results */}
        AI-powered feedback will analyze your performance and provide detailed insights here.
      </p>
    </motion.div>
  );
};

export default Feedback;
