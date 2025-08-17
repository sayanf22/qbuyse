
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import PostPage from "./pages/PostPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import TermsPage from "./pages/TermsPage";
import AboutPage from "./pages/AboutPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import SettingsPage from "./pages/SettingsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import Layout from "./components/Layout";
import SplashScreen from "./components/SplashScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - keeps data fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - reduces unnecessary requests
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="qbuyse-ui-theme">
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {showSplash ? (
                <SplashScreen onComplete={handleSplashComplete} />
              ) : (
                <Layout>
                  <Routes>
                    {/* Public routes - accessible without authentication */}
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/refund-policy" element={<RefundPolicyPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/help-support" element={<HelpSupportPage />} />
                    <Route path="/post" element={<PostPage />} />
                    <Route path="/chats" element={<ChatPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Main layout routes - accessible to everyone but interactions gated */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/user/:userId" element={<UserProfilePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              )}
            </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
