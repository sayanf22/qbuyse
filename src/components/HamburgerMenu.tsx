
import { useState } from "react";
import { Menu, X, FileText, Info, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
      icon: LogOut,
      label: "Logout",
      onClick: handleLogout,
      className: "text-red-600 hover:text-red-700 hover:bg-red-50"
    }
  ];

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={24} className="text-gray-700" />
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
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-[9999] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-700" />
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
                className={`w-full flex items-center space-x-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                  item.className || "text-gray-700 hover:text-gray-900"
                }`}
              >
                <IconComponent size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            Qbuyse © 2024
          </p>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
