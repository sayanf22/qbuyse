
import { useState, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "./BottomNavigation";
import { SEOHead } from "./SEOHead";
import { AuthModal } from "./AuthModal";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const hideNavPaths = ["/auth"];
  const shouldShowNav = !hideNavPaths.includes(location.pathname);

  const handleProtectedNavigation = (path: string) => {
    const protectedPaths = ["/chats", "/chat", "/profile", "/post"];
    
    if (protectedPaths.includes(path) && !user) {
      setShowAuthModal(true);
      return;
    }
    
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <main className="pb-24 overflow-x-hidden">
        {children}
      </main>
      
      {shouldShowNav && (
        <BottomNavigation onProtectedNavigation={handleProtectedNavigation} />
      )}
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Layout;
