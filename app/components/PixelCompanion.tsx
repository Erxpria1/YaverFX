"use client";

/**
 * PixelCompanion — Pure Canvas-based pixel art renderer.
 * Supports both LEVEL-based sprites and THEME-based sprites.
 * Theme sprites take priority when a theme is provided.
 *
 * Props:
 *   companion  — { level, name, image }  (image field is ignored)
 *   size       — canvas size in pixels (default 96)
 *   animate    — idle bounce animation (default true)
 *   theme      — optional theme override ("modern" | "cyber" | "minimal" | "pixel")
 *   compact    — smaller padding for SIRADA card (default false)
 */

import { useEffect, useRef, useState } from "react";

interface CompanionData {
  level: number;
  name: string;
  image?: string;
}

interface Props {
  companion: CompanionData;
  size?: number;
  animate?: boolean;
  theme?: "modern" | "cyber" | "minimal" | "pixel";
  compact?: boolean;
}

// ── Pixel Sprites ──────────────────────────────────────────────────────────────
// Each sprite is a 2D array of palette indices. 0 = transparent.
type Sprite = number[][];
type SpriteSet = Sprite[];

// Color palette: [R, G, B]. Index 0 = transparent.
type Color = [number, number, number];
type Palette = Color[];

// ── Level Sprites ──────────────────────────────────────────────────────────────
const LEVEL_PALETTE: Palette = [
  [0, 0, 0],             // 0: transparent
  [245, 245, 245],       // 1: white (eyes / highlights)
  [30, 30, 30],          // 2: black (outline / pupils)
  [255, 107, 94],        // 3: coral (accent / glow)
  [255, 143, 120],       // 4: coral light (body shadow)
  [255, 215, 210],       // 5: blush (cheeks)
  [100, 180, 255],       // 6: blue (break mode accent)
];

const LEVEL_SPRITES: SpriteSet = [
  // Level 1 — Çırak Yaver
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
  // Level 2 — Gözlemci
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
  // Level 3 — Odak Ustası
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
  // Level 4 — Zaman Bükücü
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
  // Level 5 — Elite
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
  // Level 6 — Efsanevi
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

const LEVEL_AURA: Color[] = [
  [255, 107, 94],
  [255, 143, 120],
  [255, 215, 0],
  [255, 159, 10],
  [255, 55, 95],
  [255, 215, 210],
];

// ── Theme Sprites ─────────────────────────────────────────────────────────────
// Each theme has a 3-sprite set: idle, happy, excited
// Palette indices match per-theme color tables below.

type ThemeId = "modern" | "cyber" | "minimal" | "pixel";

interface ThemeDef {
  palette: Palette;
  aura: Color;
  sprites: {
    idle: Sprite;
    happy: Sprite;
    excited: Sprite;
  };
}

// Modern / Kirmizi theme — warm coral/red, friendly rounded character
const MODERN_THEME: ThemeDef = {
  palette: [
    [0, 0, 0],           // 0: transparent
    [255, 245, 245],     // 1: white (eyes)
    [30, 30, 30],        // 2: black (pupils/outline)
    [255, 55, 95],       // 3: primary red (#ff375f)
    [220, 40, 80],       // 4: dark red (shadow)
    [255, 180, 190],     // 5: blush/pink
    [255, 200, 210],     // 6: light pink
  ],
  aura: [255, 55, 95],
  sprites: {
    idle: [
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
    happy: [
      [0,0,0,1,1,1,1,0,0,0,0,0],
      [0,0,1,2,2,2,2,1,0,0,0,0],
      [0,1,1,1,3,3,1,1,1,0,0,0],
      [0,1,3,3,3,3,3,3,1,0,0,0],
      [1,1,3,4,3,3,4,3,1,1,0,0],
      [1,1,3,4,4,4,4,3,1,1,0,0],
      [1,2,1,3,3,3,3,1,2,1,0,0],
      [1,2,2,3,3,3,3,2,2,1,0,0],
      [0,1,6,1,3,3,1,6,1,0,0,0],
      [0,0,1,1,1,1,1,1,0,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,0,1,0,0,0,1,0,0,0,0],
    ],
    excited: [
      [0,0,1,1,1,1,1,1,0,0,0,0],
      [0,1,2,2,2,2,2,2,1,0,0,0],
      [1,1,1,3,3,3,3,1,1,0,0,0],
      [1,3,3,3,3,3,3,3,3,1,0,0],
      [1,3,4,3,3,3,4,3,3,1,0,0],
      [1,3,4,4,4,4,4,3,3,1,0,0],
      [1,2,1,3,3,3,3,1,2,1,0,0],
      [1,2,2,3,3,3,3,2,2,1,0,0],
      [0,1,6,3,3,3,3,6,1,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,0,1,0,0,0,1,0,0,0,0],
    ],
  },
};

// Cyber theme — neon blue/purple, angular futuristic character
const CYBER_THEME: ThemeDef = {
  palette: [
    [0, 0, 0],           // 0: transparent
    [200, 240, 255],     // 1: cyan-white (eyes)
    [10, 10, 20],        // 2: dark navy (outline)
    [100, 210, 255],     // 3: neon cyan (#64d2ff)
    [0, 120, 200],       // 4: deep blue (shadow)
    [180, 120, 255],     // 5: purple accent
    [255, 220, 100],     // 6: yellow visor glow
  ],
  aura: [100, 210, 255],
  sprites: {
    idle: [
      [0,0,0,2,3,3,3,3,2,0,0,0],
      [0,0,2,3,3,3,3,3,3,2,0,0],
      [0,2,3,3,3,3,3,3,3,3,2,0],
      [0,2,1,1,3,3,1,1,2,0,0,0],
      [0,2,2,1,3,3,1,2,2,0,0,0],
      [0,2,4,3,3,3,3,3,4,2,0,0],
      [0,0,2,3,3,3,3,3,2,0,0,0],
      [0,0,2,4,3,3,4,2,0,0,0,0],
      [0,0,0,2,1,1,2,0,0,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,0,0],
    ],
    happy: [
      [0,0,0,2,3,3,3,3,2,0,0,0],
      [0,0,2,3,3,3,3,3,3,2,0,0],
      [0,2,3,3,3,3,3,3,3,3,2,0],
      [0,2,1,1,3,3,1,1,2,0,0,0],
      [0,2,2,1,3,3,1,2,2,0,0,0],
      [0,2,4,3,3,3,3,3,4,2,0,0],
      [0,0,2,3,3,3,3,3,2,0,0,0],
      [0,0,2,5,3,3,5,2,0,0,0,0],
      [0,0,6,2,1,1,2,6,0,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,0,0],
    ],
    excited: [
      [0,0,2,3,3,3,3,3,3,2,0,0],
      [0,2,3,3,3,3,3,3,3,3,2,0],
      [2,3,3,3,3,3,3,3,3,3,3,2],
      [2,1,1,6,3,3,6,1,1,2,0,0],
      [2,2,1,6,3,3,6,1,2,2,0,0],
      [2,4,3,3,3,3,3,3,3,4,2,0],
      [0,2,3,3,3,3,3,3,3,2,0,0],
      [0,2,5,3,3,3,3,5,2,0,0,0],
      [0,6,2,3,3,3,3,2,6,0,0,0],
      [0,0,2,1,1,1,1,2,0,0,0,0],
      [0,0,0,2,2,2,2,0,0,0,0,0],
      [0,0,0,0,2,2,0,0,0,0,0,0],
    ],
  },
};

// Minimal theme — soft blue, serene and calm character
const MINIMAL_THEME: ThemeDef = {
  palette: [
    [0, 0, 0],           // 0: transparent
    [240, 248, 255],     // 1: white (eyes)
    [40, 80, 120],       // 2: dark blue (pupils)
    [10, 132, 255],      // 3: iOS blue (#0a84ff)
    [0, 100, 200],       // 4: deep blue (shadow)
    [180, 210, 240],     // 5: light blue blush
    [200, 230, 255],     // 6: soft highlight
  ],
  aura: [10, 132, 255],
  sprites: {
    idle: [
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
    happy: [
      [0,0,0,1,1,1,1,0,0,0,0,0],
      [0,0,1,2,2,2,2,1,0,0,0,0],
      [0,1,1,1,3,3,1,1,1,0,0,0],
      [0,1,3,3,3,3,3,3,1,0,0,0],
      [1,1,3,4,3,3,4,3,1,1,0,0],
      [1,1,3,4,4,4,4,3,1,1,0,0],
      [1,2,1,3,3,3,3,1,2,1,0,0],
      [1,2,2,6,6,6,6,2,2,1,0,0],
      [0,1,5,1,6,6,1,5,1,0,0,0],
      [0,0,1,1,1,1,1,1,0,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,0,1,0,0,0,1,0,0,0,0],
    ],
    excited: [
      [0,0,1,1,1,1,1,1,0,0,0,0],
      [0,1,2,2,2,2,2,2,1,0,0,0],
      [1,1,1,3,3,3,3,1,1,0,0,0],
      [1,3,3,3,3,3,3,3,3,1,0,0],
      [1,3,4,3,3,3,4,3,3,1,0,0],
      [1,3,4,4,4,4,4,3,3,1,0,0],
      [1,2,1,3,3,3,3,1,2,1,0,0],
      [1,2,2,6,6,6,6,2,2,1,0,0],
      [0,1,5,6,6,6,6,5,1,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,0,1,0,0,0,1,0,0,0,0],
    ],
  },
};

// Pixel/Retro theme — classic game boy green aesthetic
const PIXEL_THEME: ThemeDef = {
  palette: [
    [0, 0, 0],           // 0: transparent
    [200, 220, 180],     // 1: light green (eyes/face)
    [24, 32, 24],        // 2: near-black green (outline)
    [46, 46, 99],        // 3: dark purple (#2e2e63)
    [255, 46, 99],       // 4: hot pink (#ff2e63)
    [140, 140, 180],     // 5: muted purple blush
    [100, 100, 160],     // 6: medium purple
  ],
  aura: [46, 46, 99],
  sprites: {
    idle: [
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
    happy: [
      [0,0,0,1,1,1,1,0,0,0,0,0],
      [0,0,1,2,2,2,2,1,0,0,0,0],
      [0,1,1,1,3,3,1,1,1,0,0,0],
      [0,1,3,3,3,3,3,3,1,0,0,0],
      [1,1,3,4,3,3,4,3,1,1,0,0],
      [1,1,3,4,4,4,4,3,1,1,0,0],
      [1,2,1,3,3,3,3,1,2,1,0,0],
      [1,2,2,6,6,6,6,2,2,1,0,0],
      [0,1,5,6,3,3,6,5,1,0,0,0],
      [0,0,1,1,1,1,1,1,0,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,0,1,0,0,0,1,0,0,0,0],
    ],
    excited: [
      [0,0,1,1,1,1,1,1,0,0,0,0],
      [0,1,2,2,2,2,2,2,1,0,0,0],
      [1,1,1,3,3,3,3,1,1,0,0,0],
      [1,3,3,3,3,3,3,3,3,1,0,0],
      [1,3,4,3,3,3,4,3,3,1,0,0],
      [1,3,4,4,4,4,4,3,3,1,0,0],
      [1,2,1,3,3,3,3,1,2,1,0,0],
      [1,2,2,6,6,6,6,2,2,1,0,0],
      [0,1,5,6,3,3,6,5,1,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,1,3,1,3,1,3,1,0,0,0],
      [0,0,0,1,0,0,0,1,0,0,0,0],
    ],
  },
};

const THEME_MAP: Record<ThemeId, ThemeDef> = {
  modern: MODERN_THEME,
  cyber: CYBER_THEME,
  minimal: MINIMAL_THEME,
  pixel: PIXEL_THEME,
};

// ── Utilities ────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

type SpriteMood = "idle" | "happy" | "excited";

function getMood(animate: boolean): SpriteMood {
  return animate ? "idle" : "idle";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PixelCompanion({
  companion,
  size = 96,
  animate = true,
  theme,
  compact = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  const posRef = useRef({ x: 0, y: 0 });
  const [mood, setMood] = useState<SpriteMood>("idle");
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine which sprite set to use
  const useTheme = theme && THEME_MAP[theme];
  const spriteData = useTheme
    ? THEME_MAP[theme]
    : {
        palette: LEVEL_PALETTE,
        aura: LEVEL_AURA[clamp(companion.level - 1, 0, LEVEL_AURA.length - 1)],
        sprites: {
          idle: LEVEL_SPRITES[clamp(companion.level - 1, 0, LEVEL_SPRITES.length - 1)],
          happy: LEVEL_SPRITES[clamp(companion.level - 1, 0, LEVEL_SPRITES.length - 1)],
          excited: LEVEL_SPRITES[clamp(companion.level - 1, 0, LEVEL_SPRITES.length - 1)],
        },
      };

  // Mood cycling for ambient variation
  useEffect(() => {
    if (!animate) return;
    const cycleMood = () => {
      const rand = Math.random();
      if (rand < 0.6) setMood("idle");
      else if (rand < 0.85) setMood("happy");
      else setMood("excited");
      const nextDelay = 2000 + Math.random() * 4000;
      moodTimerRef.current = setTimeout(cycleMood, nextDelay);
    };
    const initialDelay = setTimeout(cycleMood, 1500);
    return () => {
      clearTimeout(initialDelay);
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    };
  }, [animate]);

  // Init wandering position for compact/SIRADA mode
  useEffect(() => {
    if (compact) {
      const maxX = Math.floor(size * 0.3);
      const maxY = Math.floor(size * 0.2);
      posRef.current = {
        x: Math.floor(Math.random() * maxX * 2) - maxX,
        y: Math.floor(Math.random() * maxY * 2) - maxY,
      };
    }
  }, [compact, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = Math.floor(size / 12);
    const sprite = spriteData.sprites[mood];
    let animId: number;
    let wanderTimer = 0;
    const WANDER_INTERVAL = 2500; // change direction every 2.5s

    const draw = (t: number) => {
      timeRef.current = t;

      ctx.clearRect(0, 0, size, size);

      // Idle bounce
      const bounce = animate ? Math.floor(Math.sin(t / 500) * (compact ? 1 : 2)) : 0;

      // Head tilt for compact mode
      const headTilt = compact && mood === "excited"
        ? Math.floor(Math.sin(t / 200) * 1)
        : 0;

      // Wandering for compact mode (SIRADA card)
      if (compact && animate) {
        wanderTimer += 16;
        if (wanderTimer > WANDER_INTERVAL) {
          wanderTimer = 0;
          const maxX = Math.floor(size * 0.25);
          const maxY = Math.floor(size * 0.15);
          posRef.current = {
            x: Math.floor(Math.random() * maxX * 2) - maxX,
            y: Math.floor(Math.random() * maxY * 2) - maxY,
          };
        }
      }

      const posX = posRef.current.x;
      const posY = posRef.current.y;

      // Aura glow
      const glowSize = compact ? size * 0.5 : size * 0.7;
      const glowOff = (size - glowSize) / 2;
      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, glowSize / 2
      );
      const aura = spriteData.aura;
      gradient.addColorStop(0, `rgba(${aura[0]},${aura[1]},${aura[2]},${compact ? 0.15 : 0.3})`);
      gradient.addColorStop(1, `rgba(${aura[0]},${aura[1]},${aura[2]},0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(glowOff, glowOff, glowSize, glowSize);

      // Draw sprite pixels
      for (let row = 0; row < sprite.length; row++) {
        for (let col = 0; col < sprite[row].length; col++) {
          const px = sprite[row][col];
          if (px === 0) continue;

          const [r, g, b] = spriteData.palette[px];
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(
            col * scale + posX + headTilt,
            row * scale + bounce + posY,
            scale,
            scale
          );
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [spriteData, size, animate, mood, compact]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        imageRendering: "pixelated",
        display: "block",
        ...(compact ? { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" } : {}),
      }}
      aria-label={companion.name}
    />
  );
}
