"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  hover = true,
}) => {
  return (
    <>
      <GlassFilter />
      <div
        className={`
          relative overflow-hidden rounded-2xl
          transition-all duration-500
          ${hover ? "hover:scale-[1.02] hover:shadow-2xl" : ""}
          ${className}
        `}
        style={{
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px rgba(0, 0, 0, 0.05)",
          transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.2)",
        }}
      >
        {/* Glass Layers */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backdropFilter: "blur(12px)",
            background: "rgba(255, 255, 255, 0.6)",
            filter: "url(#glass-distortion)",
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            boxShadow:
              "inset 1px 1px 2px 0 rgba(255, 255, 255, 0.8), inset -1px -1px 2px 0 rgba(255, 255, 255, 0.4)",
          }}
        />

        {/* Content */}
        <div className="relative z-20">{children}</div>
      </div>
    </>
  );
};

export const GlassButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}> = ({ children, onClick, disabled, variant = "primary", className = "" }) => {
  const variantStyles = {
    primary: "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
    secondary: "bg-white/40 text-gray-800",
  };

  return (
    <>
      <GlassFilter />
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative overflow-hidden rounded-xl px-6 py-3
          font-medium transition-all duration-500
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:scale-105 hover:shadow-xl
          ${variantStyles[variant]}
          ${className}
        `}
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
          transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.2)",
        }}
      >
        {/* Glass Effect */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backdropFilter: "blur(8px)",
            filter: "url(#glass-distortion)",
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)",
          }}
        />

        {/* Content */}
        <div className="relative z-20 flex items-center gap-2">{children}</div>
      </button>
    </>
  );
};

export const GlassBadge: React.FC<{
  children: React.ReactNode;
  variant?: "success" | "warning" | "info" | "default";
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    success: "bg-green-500/20 text-green-700 border-green-300/50",
    warning: "bg-yellow-500/20 text-yellow-700 border-yellow-300/50",
    info: "bg-blue-500/20 text-blue-700 border-blue-300/50",
    default: "bg-gray-500/20 text-gray-700 border-gray-300/50",
  };

  return (
    <>
      <GlassFilter />
      <div
        className={`
          relative overflow-hidden rounded-full px-3 py-1
          text-sm font-medium border
          ${variantStyles[variant]}
          ${className}
        `}
        style={{
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            filter: "url(#glass-distortion)",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </>
  );
};

// SVG Filter Component (只需要一次)
const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.003"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="3"
        specularConstant="0.8"
        specularExponent="80"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-100" y="-100" z="200" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="100"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
