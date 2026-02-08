import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Auth0ProviderWithNavigate } from "./components/auth/Auth0ProviderWithNavigate";
import { Auth0TokenSync } from "./components/auth/Auth0TokenSync";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import FeedbackPage from "./pages/FeedbackPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { useSessionStore } from "./store/useSessionStore";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    useSessionStore.getState().init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Auth0ProviderWithNavigate>
            <Auth0TokenSync />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/session" element={<SessionPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Auth0ProviderWithNavigate>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
