
import React, { useEffect, useState } from "react";
import Logo from "./Logo";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showLogo, setShowLogo] = useState(false);
  const [showSlideUp, setShowSlideUp] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      // Faster sequence for quicker loading
      setTimeout(() => setShowLogo(true), 100);
      
      // Slide logo up after 1 second (reduced from 1.8s)
      setTimeout(() => setShowSlideUp(true), 1000);
      
      // Show title after slide up completes (reduced delay)
      setTimeout(() => setShowTitle(true), 1400);
      
      // Show subtitle after title (reduced delay)
      setTimeout(() => setShowSubtitle(true), 1800);
      
      // Start fade out much sooner (reduced from 4.2s to 2.5s)
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Faster fade out
      }, 2500);
    };

    sequence();
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`} style={{ backgroundColor: 'hsl(180, 83%, 45%)' }}>
      <div className="text-center relative">
        {/* Logo Container */}
        <div className={`relative transition-transform duration-800 ease-out ${
          showSlideUp ? 'slide-up' : ''
        }`}>
          {/* Logo using the reusable Logo component */}
          <div className={`relative mx-auto mb-8 ${showLogo ? 'zoom-in-elastic' : 'opacity-0'}`}>
            <Logo size={192} className="mx-auto" />
          </div>
        </div>

        {/* App Title */}
        <div className={`${showTitle ? 'scale-pop' : 'opacity-0'}`}>
          <h1 className="text-6xl font-bold text-white mb-4" style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.02em'
          }}>
            Qbuyse
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`${showSubtitle ? 'fade-in-up' : 'opacity-0'}`}>
          <p className="text-white/80 text-xl font-light tracking-wide">
            Your Marketplace
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
