"use client";

/**
 * PixelHero — Walking pixel character for SIRADA card.
 * Uses CSS animations instead of canvas for reliable rendering.
 * Theme-aware with distinct characters per theme.
 */

import { useEffect, useState, useRef } from "react";

type Theme = "modern" | "cyber" | "minimal" | "pixel";

interface Props {
  theme: Theme;
  task?: string;
  size?: number;
}

// Theme configurations
const THEMES: Record<Theme, {
  name: string;
  heroName: string;
  bg: string;
  bgGradient: string;
  border: string;
  textColor: string;
  heroColor: string;
  heroSecondary: string;
  heroAccent: string;
  heroAsset: string;
  heroPoster: string;
}> = {
  modern: {
    name: "Neo",
    heroName: "SIRADA-01",
    bg: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    bgGradient: "radial-gradient(ellipse at 30% 20%, rgba(255, 107, 107, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255, 142, 83, 0.1) 0%, transparent 50%)",
    border: "rgba(255, 107, 107, 0.4)",
    textColor: "#ff6b6b",
    heroColor: "#ff6b6b",
    heroSecondary: "#ffd93d",
    heroAccent: "#6bcb77",
    heroAsset: "/sirada-heroes/src-clean/sirada-hero-01.png",
    heroPoster: "/sirada-heroes/animated/sirada-hero-01-poster.png",
  },
  cyber: {
    name: "Glitch",
    heroName: "SIRADA-07",
    bg: "linear-gradient(145deg, #0d0d0d 0%, #1a0a2e 50%, #0a1628 100%)",
    bgGradient: "radial-gradient(ellipse at 20% 30%, rgba(0, 255, 255, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(138, 43, 226, 0.1) 0%, transparent 50%)",
    border: "rgba(0, 255, 255, 0.4)",
    textColor: "#00ffff",
    heroColor: "#00ffff",
    heroSecondary: "#ff00ff",
    heroAccent: "#39ff14",
    heroAsset: "/sirada-heroes/src-clean/sirada-hero-07.png",
    heroPoster: "/sirada-heroes/animated/sirada-hero-07-poster.png",
  },
  minimal: {
    name: "Ghost",
    heroName: "SIRADA-10",
    bg: "linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 50%, #0d1117 100%)",
    bgGradient: "radial-gradient(ellipse at 50% 30%, rgba(10, 132, 255, 0.08) 0%, transparent 50%)",
    border: "rgba(10, 132, 255, 0.4)",
    textColor: "#0a84ff",
    heroColor: "#0a84ff",
    heroSecondary: "#5ac8fa",
    heroAccent: "#64d2ff",
    heroAsset: "/sirada-heroes/src-clean/sirada-hero-10.png",
    heroPoster: "/sirada-heroes/animated/sirada-hero-10-poster.png",
  },
  pixel: {
    name: "Slime",
    heroName: "SIRADA-11",
    bg: "linear-gradient(145deg, #1a0a1a 0%, #2d1b4e 50%, #1a0a2e 100%)",
    bgGradient: "radial-gradient(ellipse at 30% 20%, rgba(255, 46, 99, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255, 159, 67, 0.1) 0%, transparent 50%)",
    border: "rgba(255, 46, 99, 0.4)",
    textColor: "#ff2e63",
    heroColor: "#ff2e63",
    heroSecondary: "#ff9f43",
    heroAccent: "#a55eea",
    heroAsset: "/sirada-heroes/src-clean/sirada-hero-11.png",
    heroPoster: "/sirada-heroes/animated/sirada-hero-11-poster.png",
  },
};

export default function PixelHero({ theme = "modern", task = "", size = 100 }: Props) {
  const config = THEMES[theme];
  const [isWalking, setIsWalking] = useState(true);
  const [walkDirection, setWalkDirection] = useState<"left" | "right">("right");
  const [isWaving, setIsWaving] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [walkCycle, setWalkCycle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Walking animation cycle
  useEffect(() => {
    if (!isWalking || isFlipping) return;
    
    const interval = setInterval(() => {
      setWalkCycle((prev) => (prev + 1) % 4);
    }, 200);
    
    return () => clearInterval(interval);
  }, [isWalking, isFlipping]);
  
  // Position tracking for wave/flip triggers
  const [position, setPosition] = useState(10); // percentage
  
  useEffect(() => {
    if (!isWalking || isFlipping) return;
    
    const moveInterval = setInterval(() => {
      setPosition((prev) => {
        const next = walkDirection === "right" ? prev + 0.8 : prev - 0.8;
        
        // Flip at edges
        if (next >= 85) {
          setWalkDirection("left");
          triggerFlip();
          return 85;
        }
        if (next <= 10) {
          setWalkDirection("right");
          triggerFlip();
          return 10;
        }
        
        // Wave in center
        if (Math.abs(prev - 45) < 2 && !isWaving) {
          triggerWave();
        }
        
        return next;
      });
    }, 80);
    
    return () => clearInterval(moveInterval);
  }, [isWalking, isFlipping, walkDirection, isWaving]);
  
  const triggerWave = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 800);
  };
  
  const triggerFlip = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 600);
  };
  
  // Get character SVG based on theme
  const renderHero = () => {
    const { heroColor, heroSecondary, heroAccent } = config;
    
    if (theme === "modern") {
      // Robot character
      return (
        <svg viewBox="0 0 32 32" className="hero-svg">
          {/* Body */}
          <rect x="10" y="8" width="12" height="14" fill={heroColor} />
          {/* Head */}
          <rect x="8" y="4" width="16" height="10" rx="2" fill={heroColor} />
          {/* Eyes */}
          <rect x="11" y="7" width="3" height="3" fill={heroSecondary} className={isWaving ? "eye-blink" : ""} />
          <rect x="18" y="7" width="3" height="3" fill={heroSecondary} className={isWaving ? "eye-blink" : ""} />
          {/* Antenna */}
          <rect x="15" y="1" width="2" height="3" fill={heroAccent} />
          <circle cx="16" cy="1" r="1.5" fill={heroAccent} />
          {/* Arms */}
          {isWaving ? (
            <rect x="22" y="6" width="3" height="8" fill={heroColor} />
          ) : (
            <rect x="22" y="10" width="3" height="6" fill={heroColor} />
          )}
          <rect x="7" y="10" width="3" height="6" fill={heroColor} />
          {/* Legs - animated */}
          <rect x="11" y="22" width="3" height="5" fill={heroColor} style={{ transform: `translateY(${walkCycle % 2 === 0 ? 0 : 1}px)` }} />
          <rect x="18" y="22" width="3" height="5" fill={heroColor} style={{ transform: `translateY(${walkCycle % 2 === 0 ? 1 : 0}px)` }} />
        </svg>
      );
    }
    
    if (theme === "cyber") {
      // Ninja/cat character
      return (
        <svg viewBox="0 0 32 32" className="hero-svg">
          {/* Body */}
          <rect x="12" y="10" width="8" height="12" fill={heroColor} />
          {/* Head */}
          <circle cx="16" cy="8" r="6" fill={heroColor} />
          {/* Visor/Eyes */}
          <rect x="11" y="6" width="10" height="3" fill={heroSecondary} />
          {/* Ears */}
          <polygon points="11,4 13,8 10,8" fill={heroColor} />
          <polygon points="21,4 19,8 22,8" fill={heroColor} />
          {/* Arms */}
          {isWaving ? (
            <rect x="20" y="5" width="6" height="3" fill={heroColor} />
          ) : (
            <rect x="20" y="11" width="4" height="6" fill={heroColor} />
          )}
          <rect x="8" y="11" width="4" height="6" fill={heroColor} />
          {/* Legs */}
          <rect x="12" y="22" width="3" height="4" fill={heroColor} style={{ transform: `translateY(${walkCycle % 2 === 0 ? 0 : 1}px)` }} />
          <rect x="17" y="22" width="3" height="4" fill={heroColor} style={{ transform: `translateY(${walkCycle % 2 === 0 ? 1 : 0}px)` }} />
          {/* Tail */}
          <rect x="4" y="18" width="8" height="2" fill={heroAccent} />
        </svg>
      );
    }
    
    if (theme === "minimal") {
      // Ghost character
      return (
        <svg viewBox="0 0 32 32" className="hero-svg">
          {/* Ghost body */}
          <path d="M8 28 L8 14 Q8 4 16 4 Q24 4 24 14 L24 28 L22 26 L20 28 L18 26 L16 28 L14 26 L12 28 L10 26 Z" fill={heroColor} />
          {/* Eyes */}
          <circle cx="12" cy="12" r="3" fill="white" />
          <circle cx="20" cy="12" r="3" fill="white" />
          <circle cx="12" cy="12" r="1.5" fill={heroSecondary} />
          <circle cx="20" cy="12" r="1.5" fill={heroSecondary} />
          {/* Arms */}
          {isWaving && (
            <path d="M25 16 Q28 12 26 8 Q24 4 22 8" stroke={heroColor} strokeWidth="2" fill="none" />
          )}
        </svg>
      );
    }
    
    // pixel - Slime character
    return (
      <svg viewBox="0 0 32 32" className="hero-svg">
        {/* Slime body - bouncy */}
        <ellipse cx="16" cy="20" rx={10 + (walkCycle % 2) * 1} ry={8 + (walkCycle % 2) * 1} fill={heroColor} />
        {/* Top bump */}
        <ellipse cx="16" cy="14" rx={6 + (walkCycle % 2) * 1} ry={5} fill={heroColor} />
        {/* Eyes */}
        <rect x="11" y="14" width="3" height="4" fill="white" />
        <rect x="18" y="14" width="3" height="4" fill="white" />
        <rect x="12" y="15" width="1.5" height="2" fill="black" />
        <rect x="19" y="15" width="1.5" height="2" fill="black" />
        {/* Shine */}
        <ellipse cx="13" cy="11" rx="2" ry="1.5" fill={heroSecondary} opacity="0.6" />
        {/* Wave arm */}
        {isWaving && (
          <rect x="24" y="10" width="3" height="6" fill={heroAccent} />
        )}
      </svg>
    );
  };
  
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${size}px`,
        position: "relative",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      {/* Background gradient mesh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: config.bgGradient,
          pointerEvents: "none",
        }}
      />
      
      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${config.border}15 1px, transparent 1px),
            linear-gradient(90deg, ${config.border}15 1px, transparent 1px)
          `,
          backgroundSize: "8px 8px",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />
      
      {/* Task text watermark */}
      {task && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <span
            style={{
              fontSize: `${Math.max(12, size * 0.18)}px`,
              fontWeight: 800,
              color: config.textColor,
              opacity: 0.08,
              textAlign: "center",
              padding: "0 16px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              fontFamily: "monospace",
            }}
          >
            {task}
          </span>
        </div>
      )}
      
      {/* Ground line */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "5%",
          right: "5%",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${config.border}, transparent)`,
          zIndex: 1,
        }}
      />
      
      {/* Hero container */}
      <div
        style={{
          position: "absolute",
          left: `${position}%`,
          bottom: "18%",
          transform: `translateX(-50%) ${walkDirection === "left" ? "scaleX(-1)" : ""} ${isFlipping ? "rotate(360deg)" : ""}`,
          transition: isFlipping 
            ? "transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)" 
            : "left 80ms linear",
          willChange: "left, transform",
          zIndex: 2,
          filter: `drop-shadow(0 0 8px ${config.heroColor}40)`,
        }}
      >
        <div style={{ width: `${size * 0.72}px`, height: `${size * 0.72}px` }}>
          <img
            src={config.heroAsset}
            alt={`${config.heroName} animated hero`}
            className="sirada-animated-hero"
            draggable={false}
          />
        </div>
      </div>
      
      {/* Wave particles */}
      {isWaving && (
        <div
          style={{
            position: "absolute",
            left: `${position + (walkDirection === "right" ? 5 : -5)}%`,
            top: "20%",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "4px",
                height: "4px",
                background: config.heroSecondary,
                borderRadius: "50%",
                left: `${i * 6 - 6}px`,
                top: `${i * 4}px`,
                opacity: 0.8 - i * 0.25,
                animation: "waveParticle 0.5s ease-out forwards",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Theme badge */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: "8px",
          fontWeight: 700,
          color: config.textColor,
          opacity: 0.5,
          letterSpacing: "0.1em",
          fontFamily: "monospace",
        }}
      >
        {config.heroName}
      </div>
      
      <style jsx>{`
        @keyframes waveParticle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-16px) scale(0);
            opacity: 0;
          }
        }
        .hero-svg {
          width: 100%;
          height: 100%;
          image-rendering: pixelated;
        }
        .sirada-animated-hero {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          user-select: none;
          pointer-events: none;
          filter: saturate(1.12) contrast(1.05) drop-shadow(0 0 14px ${config.heroColor}66);
          transform-origin: center bottom;
          animation: siradaHeroPulse 2.667s ease-in-out infinite;
        }
        @keyframes siradaHeroPulse {
          0%, 100% { transform: translateY(0) rotate(-1deg) scale(1); }
          50% { transform: translateY(-8px) rotate(1.5deg) scale(1.045); }
        }
        .eye-blink {
          animation: blink 0.2s ease-in-out;
        }
        @keyframes blink {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  );
}
