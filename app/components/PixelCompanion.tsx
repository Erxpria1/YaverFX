"use client";

/**
 * PixelCompanion — Pure Canvas-based pixel art renderer.
 * No external image files required. Renders a clean, chunky pixel-art
 * character using the Canvas 2D API.
 *
 * Props:
 *   companion — { level, name, image }  (image field is ignored)
 *   size      — canvas size in pixels (default 96)
 *   animate   — idle bounce animation (default true)
 */

import { useEffect, useRef } from "react";

interface CompanionData {
  level: number;
  name: string;
  image?: string;
}

interface Props {
  companion: CompanionData;
  size?: number;
  animate?: boolean;
}

// ── Pixel Sprites ──────────────────────────────────────────────────────────────
// Each sprite is a 2D array of palette indices. 0 = transparent.
type Sprite = number[][];

// 6-level color palette — indexed by sprite data
// Palette: [R, G, B, Alpha?]. Alpha omitted = fully opaque.
const PALETTE: [number, number, number][] = [
  [0, 0, 0],       // 0: transparent
  [245, 245, 245],    // 1: white (eyes / highlights)
  [30, 30, 30],       // 2: black (outline / pupils)
  [255, 107, 94],     // 3: coral (accent / glow)
  [255, 143, 120],    // 4: coral light (body shadow)
  [255, 215, 210],    // 5: blush (cheeks)
  [100, 180, 255],    // 6: blue (break mode accent)
];

// Each companion has a unique 12×12 sprite
const SPRITES: Sprite[] = [
  // Level 1 — Çırak Yaver (simple, friendly blob)
  [
    [0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,1,2,2,2,2,1,0,0,0,0],
    [0,1,1,1,3,3,1,1,1,0,0,0],
    [0,1,3,3,3,3,3,3,1,0,0,0],
    [1,1,3,4,3,3,4,3,1,1,0,0],
    [1,1,3,4,4,4,4,3,1,1,0,0],
    [1,2,1,3,3,3,3,1,2,1,0,0],
    [1,2,2,1,1,1,1,2,2,1,0,0],
    [0,1,5,1,0,0,1,5,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,3,1,3,1,3,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0],
  ],
  // Level 2 — Gözlemci (has a little antenna / monocle)
  [
    [0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,2,2,1,0,0,0,0,0],
    [0,0,1,1,3,3,1,1,0,0,0,0],
    [0,1,2,1,3,3,1,2,1,0,0,0],
    [1,1,2,3,3,3,3,2,1,1,0,0],
    [1,1,1,3,4,4,3,1,1,1,0,0],
    [1,2,1,3,3,3,3,1,2,1,0,0],
    [1,2,1,1,1,1,1,1,2,1,0,0],
    [0,1,5,1,0,0,1,5,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,3,1,3,1,3,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0],
  ],
  // Level 3 — Odak Ustası (determined expression, sharper outline)
  [
    [0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,2,2,1,0,0,0,0,0],
    [0,0,1,1,3,3,1,1,0,0,0,0],
    [0,2,1,1,3,3,1,1,2,0,0,0],
    [2,2,2,3,3,3,3,3,2,2,0,0],
    [2,2,1,3,4,4,3,1,2,2,0,0],
    [2,2,1,3,3,3,3,1,2,2,0,0],
    [0,2,1,1,1,1,1,1,2,0,0,0],
    [0,0,1,5,1,0,1,5,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,2,3,2,3,2,3,2,0,0,0],
    [0,0,0,2,0,0,0,2,0,0,0,0],
  ],
  // Level 4 — Zaman Bükücü (cool, slightly mysterious)
  [
    [0,0,0,1,1,1,1,0,0,0,0,0],
    [0,0,2,2,2,2,2,2,0,0,0,0],
    [0,1,1,3,3,3,3,1,1,0,0,0],
    [0,1,3,1,3,3,1,3,1,0,0,0],
    [1,1,3,3,3,3,3,3,1,1,0,0],
    [1,1,3,4,4,4,4,3,1,1,0,0],
    [1,2,1,3,3,3,3,1,2,1,0,0],
    [1,2,1,1,1,1,1,1,2,1,0,0],
    [0,1,5,1,0,0,1,5,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,3,1,3,1,3,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0],
  ],
  // Level 5 — Elite (sharp, clean, confident)
  [
    [0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,2,2,2,2,2,2,2,0,0,0],
    [0,1,1,3,3,3,3,3,1,1,0,0],
    [0,1,2,1,3,3,1,2,1,0,0,0],
    [2,2,2,3,3,3,3,3,2,2,0,0],
    [2,2,1,3,4,4,3,1,2,2,0,0],
    [2,2,1,3,3,3,3,1,2,2,0,0],
    [0,2,1,1,1,1,1,1,2,0,0,0],
    [0,0,1,5,1,0,1,5,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,2,3,2,3,2,3,2,0,0,0],
    [0,0,0,2,0,0,0,2,0,0,0,0],
  ],
  // Level 6 — Efsanevi (crown, aura, legendary)
  [
    [0,1,0,1,0,1,0,1,0,0,0,0],
    [0,0,1,0,1,0,1,0,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,2,2,2,2,2,2,0,0,0,0],
    [0,1,1,3,3,3,3,1,1,0,0,0],
    [0,1,2,1,3,3,1,2,1,0,0,0],
    [2,2,2,3,3,3,3,3,2,2,0,0],
    [2,2,1,3,4,4,3,1,2,2,0,0],
    [2,2,1,3,3,3,3,1,2,2,0,0],
    [0,2,1,1,1,1,1,1,2,0,0,0],
    [0,0,1,5,1,0,1,5,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0],
    [0,0,2,3,2,3,2,3,2,0,0,0],
    [0,0,0,2,0,0,0,2,0,0,0,0],
  ],
];

// Aura/halo colors per level
const AURA_COLORS: [number, number, number][] = [
  [255, 107, 94],
  [255, 143, 120],
  [255, 215, 0],
  [255, 159, 10],
  [255, 55, 95],
  [255, 215, 210],
];

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

export default function PixelCompanion({ companion, size = 96, animate = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);

  const sprite = SPRITES[clamp(companion.level - 1, 0, SPRITES.length - 1)];
  const auraColor = AURA_COLORS[clamp(companion.level - 1, 0, AURA_COLORS.length - 1)];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pixel scale: fit sprite into canvas, align to pixel grid
    const scale = Math.floor(size / sprite[0].length);

    let animId: number;

    const draw = (t: number) => {
      timeRef.current = t;

      ctx.clearRect(0, 0, size, size);

      // Subtle idle bounce
      const bounce = animate
        ? Math.floor(Math.sin(t / 500) * 2)
        : 0;

      // Aura glow (drawn as a soft square behind)
      const glowSize = size * 0.7;
      const glowOff = (size - glowSize) / 2;
      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, glowSize / 2
      );
      gradient.addColorStop(0, `rgba(${auraColor.join(",")}, 0.3)`);
      gradient.addColorStop(1, `rgba(${auraColor.join(",")}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(glowOff, glowOff, glowSize, glowSize);

      // Draw sprite pixels
      for (let row = 0; row < sprite.length; row++) {
        for (let col = 0; col < sprite[row].length; col++) {
          const px = sprite[row][col];
          if (px === 0) continue; // transparent

          const [r, g, b] = PALETTE[px];
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(
            col * scale,
            (row * scale) + bounce,
            scale,
            scale
          );
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [sprite, auraColor, size, animate]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        imageRendering: "pixelated",
        display: "block",
      }}
      aria-label={companion.name}
    />
  );
}