
import { useState } from "react";
<<<<<<< HEAD
import { Menu, X, FileText, Info, Settings, LogOut, User } from "lucide-react";
=======
import { Menu, X, FileText, Info, Settings, LogOut, User, RefreshCw, LogIn } from "lucide-react";
>>>>>>> c919ab7 (updates new)
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
<<<<<<< HEAD
=======
import { useAuth } from "@/hooks/useAuth";
>>>>>>> c919ab7 (updates new)

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const { user } = useAuth();
>>>>>>> c919ab7 (updates new)

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

<<<<<<< HEAD
=======
  const handleLogin = () => {
    navigate("/auth");
    setIsOpen(false);
  };

>>>>>>> c919ab7 (updates new)
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
<<<<<<< HEAD
      icon: LogOut,
      label: "Logout",
      onClick: handleLogout,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50"
=======
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
>>>>>>> c919ab7 (updates new)
    }
  ];

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
<<<<<<< HEAD
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={24} className="text-gray-700" />
=======
        className="p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <Menu size={24} className="text-foreground" />
>>>>>>> c919ab7 (updates new)
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
<<<<<<< HEAD
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-[9999] transform transition-transform duration-300 ease-in-out ${
=======
        className={`fixed top-0 left-0 h-full w-80 bg-background shadow-xl z-[9999] transform transition-transform duration-300 ease-in-out ${
>>>>>>> c919ab7 (updates new)
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
<<<<<<< HEAD
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
=======
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Menu</h2>
>>>>>>> c919ab7 (updates new)
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
<<<<<<< HEAD
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-700" />
=======
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={24} className="text-foreground" />
>>>>>>> c919ab7 (updates new)
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
<<<<<<< HEAD
                className={`w-full flex items-center space-x-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                  item.className || "text-gray-700 hover:text-gray-900"
=======
                className={`w-full flex items-center space-x-4 px-6 py-4 text-left hover:bg-muted transition-colors ${
                  item.className || "text-foreground hover:text-foreground"
>>>>>>> c919ab7 (updates new)
                }`}
              >
                <IconComponent size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
<<<<<<< HEAD
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
=======
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-muted">
          <p className="text-sm text-muted-foreground text-center">
>>>>>>> c919ab7 (updates new)
            Qbuyse © 2024
          </p>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
