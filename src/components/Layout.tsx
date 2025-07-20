
import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-24 overflow-x-hidden">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;
