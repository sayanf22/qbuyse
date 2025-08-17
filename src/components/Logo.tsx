import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size = 80, className = "" }: LogoProps) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Magnifying glass handle - positioned at bottom right */}
      <div 
        className="absolute"
        style={{ 
          width: size * 0.33,
          height: size * 0.33,
          bottom: -size * 0.05,
          right: size * 0.05,
          transform: 'rotate(45deg)',
          transformOrigin: 'top left'
        }}
      >
        {/* Handle shaft */}
        <div 
          className="rounded-full"
          style={{ 
            width: size * 0.125,
            height: size * 0.33,
            backgroundColor: 'hsl(210, 100%, 20%)' 
          }}
        ></div>
      </div>
      
      {/* Main magnifying glass lens */}
      <div className="relative" style={{ width: size * 0.75, height: size * 0.75 }}>
        {/* Outer ring - dark navy blue */}
        <div 
          className="rounded-full flex items-center justify-center relative"
          style={{ 
            width: size * 0.75,
            height: size * 0.75,
            borderWidth: size * 0.05,
            borderColor: 'hsl(210, 100%, 20%)',
            backgroundColor: 'hsl(180, 83%, 45%)'
          }}
        >
          {/* Shopping bag container - centered */}
          <div className="relative flex items-center justify-center">
            {/* Orange shopping bag */}
            <div 
              className="rounded-t-xl flex items-center justify-center relative"
              style={{ 
                width: size * 0.42,
                height: size * 0.33,
                backgroundColor: 'hsl(25, 95%, 53%)' 
              }}
            >
              {/* Bag handles - dark blue to match the ring */}
              <div 
                className="absolute rounded-full bg-transparent"
                style={{ 
                  width: size * 0.08,
                  height: size * 0.1,
                  top: -size * 0.08,
                  left: size * 0.08,
                  borderWidth: size * 0.025,
                  borderColor: 'hsl(210, 100%, 20%)' 
                }}
              ></div>
              <div 
                className="absolute rounded-full bg-transparent"
                style={{ 
                  width: size * 0.08,
                  height: size * 0.1,
                  top: -size * 0.08,
                  right: size * 0.08,
                  borderWidth: size * 0.025,
                  borderColor: 'hsl(210, 100%, 20%)' 
                }}
              ></div>
              
              {/* White Q letter - bold and centered */}
              <span 
                className="text-white font-bold" 
                style={{ fontSize: size * 0.25 }}
              >
                Q
              </span>
            </div>
          </div>
          
          {/* Three white dots at bottom */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 flex"
            style={{ 
              bottom: size * 0.08,
              gap: size * 0.02
            }}
          >
            <div 
              className="bg-white rounded-full" 
              style={{ 
                width: size * 0.05, 
                height: size * 0.05 
              }}
            ></div>
            <div 
              className="bg-white rounded-full" 
              style={{ 
                width: size * 0.05, 
                height: size * 0.05 
              }}
            ></div>
            <div 
              className="bg-white rounded-full" 
              style={{ 
                width: size * 0.05, 
                height: size * 0.05 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;