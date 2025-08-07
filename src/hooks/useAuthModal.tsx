import { useState } from "react";

export const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"login" | "signup">("login");

  const openModal = (tab: "login" | "signup" = "login") => {
    setDefaultTab(tab);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    defaultTab,
    openModal,
    closeModal,
  };
};