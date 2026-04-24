# Pixel Hero — SIRADA Card Side-Scroller Animation

## Goal
Replace the static small avatar in the SIRADA card with a full-width animated pixel hero that walks back and forth across the card, waves in the middle, and does a flip at each end.

## Concept
The SIRADA card becomes a stage. A pixel hero (humanoid character) walks horizontally across the full width. When reaching the center, it waves. When reaching an edge, it flips/somersaults, then walks back. The task text appears as a soft overlay behind the character.

## Design

### Layout
```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐    │
│  │  ←👾←  🖐  →👾→                     │    │  ← Hero walks L↔R
│  └─────────────────────────────────────┘    │
│                                             │
│       📋 "Matematik ödevi bitir"           │  ← Task below
│       Sirada                                  │
└─────────────────────────────────────────────┘
```

### Pixel Hero Design
- **Size**: 16×20 pixels per frame
- **Style**: Classic side-scroller humanoid, chunky pixel art
- **Walk cycle**: 4 frames (leg positions alternate)
- **Wave frame**: Single frame with arm raised
- **Flip frames**: 3 frames (crouch → rotate → land)

### Theme Colors
Each theme gets a distinct hero color scheme:

| Theme   | Primary | Accent | Outline |
|---------|---------|--------|---------|
| modern  | #ff375f | #ff6b8a | #c0254a |
| cyber   | #64d2ff | #a0e4ff | #3aa0cc |
| minimal | #0a84ff | #5aaaff | #0060cc |
| pixel   | #ff2e63 | #ff6080 | #aa1040 |

## Animation Spec

### Walk Animation
- Total duration: **8 seconds per full cycle** (L → center → R → center → L)
- Walk speed: ~120px/second (card is ~280px wide, hero is ~32px wide)
- Walk frames: 4 frames cycling at 150ms per frame
- Hero faces direction of travel (flipped horizontally)

### Wave Event
- Trigger: When hero crosses the 45%-55% center zone
- Animation: Arm raises for 400ms, waves 2x
- Only triggers once per pass (cooldown until next pass)

### Flip Event
- Trigger: When hero reaches left or right edge (5% / 95% position)
- Animation: 3-frame somersault (crouch → flip → land), 600ms total
- During flip: hero pauses horizontal movement for 600ms
- After flip: resumes walking in opposite direction

### Idle Between Task Changes
- When no task is featured: hero shows idle stance (gentle bob)
- When new task is picked: hero does a small jump animation

## Implementation

### Files to Create/Modify
1. `app/components/PixelHero.tsx` — **NEW** full component
2. `app/components/SiradaCard.tsx` — **NEW** wrapper component (the card itself)
3. `app/page.tsx` — replace `<PixelCompanion>` in SIRADA card with `<SiradaCard>`
4. `app/globals.css` — add `.sirada-hero-card` styles

### PixelHero.tsx Spec
```tsx
interface Props {
  theme: "modern" | "cyber" | "minimal" | "pixel";
  task: string; // task text to display in background
  size?: number; // height in px (default 120)
}
```

### Animation Engine
- Use `requestAnimationFrame` for smooth walk progression
- CSS `transform: translateX()` for horizontal position
- CSS sprite sheet for character frames (all states in one image)
- Background: `linear-gradient` with theme color at low opacity
- Task text: centered, semi-transparent white, large font
- Direction flip: `scaleX(-1)` CSS transform

### Sprite Sheet Structure
All frames in one horizontal strip, 16px wide each:
`[walk1][walk2][walk3][walk4][wave][flip1][flip2][flip3][idle]`

Generated via Canvas 2D API (no external image needed) — draw pixel art programmatically.

### Performance
- Use `will-change: transform` on hero element
- Pause animation when card is not visible (IntersectionObserver)
- Target 60fps on mobile
