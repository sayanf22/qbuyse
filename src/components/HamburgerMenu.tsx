
import { useState } from "react";
import { Menu, X, FileText, Info, Settings, LogOut, User, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
    setIsOpen(false);
  };

  const handleLogin = () => {
    navigate("/auth");
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      onClick: () => {
        navigate("/profile");
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        navigate("/settings");
        setIsOpen(false);
      }
    },
    {
      icon: FileText,
      label: "Terms & Conditions",
      onClick: () => {
        navigate("/terms");
        setIsOpen(false);
      }
    },
    {
      icon: Info,
      label: "About",
      onClick: () => {
        navigate("/about");
        setIsOpen(false);
      }
    },
    {
      icon: RefreshCw,
      label: "Refund Policy",
      onClick: () => {
        navigate("/refund-policy");
        setIsOpen(false);
      }
    },
    // Conditionally show Login or Logout
    user ? {
      icon: LogOut,
      label: "Logout",
      onClick: handleLogout,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
    } : {
      icon: LogIn,
      label: "Login",
      onClick: handleLogin,
      className: "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950"
    }
  ];

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <Menu size={24} className="text-foreground" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] transition-opacity duration-300"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-background shadow-xl z-[9999] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={24} className="text-foreground" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="py-4">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-4 px-6 py-4 text-left hover:bg-muted transition-colors ${
                  item.className || "text-foreground hover:text-foreground"
                }`}
              >
                <IconComponent size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-muted">
          <p className="text-sm text-muted-foreground text-center">
            Qbuyse © 2024
          </p>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
