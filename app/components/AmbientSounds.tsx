"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type SoundType = "whiteNoise" | "rain" | "forest";

const SOUNDS: { id: SoundType; label: string }[] = [
  { id: "whiteNoise", label: "Beyaz Gürültü" },
  { id: "rain", label: "Yağmur" },
  { id: "forest", label: "Orman" },
];

function createNoiseBuffer(ctx: AudioContext, type: SoundType) {
  const rate = ctx.sampleRate;
  const length = rate * 2;
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < length; i++) {
    if (type === "whiteNoise") {
      data[i] = Math.random() * 2 - 1;
    } else if (type === "rain") {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    } else if (type === "forest") {
      const t = i / rate;
      data[i] = Math.sin(t * 0.5) * 0.1 + (Math.random() * 2 - 1) * 0.05;
    }
  }
  return buffer;
}

export default function AmbientSounds() {
  const [sounds, setSounds] = useState<Record<SoundType, { playing: boolean; volume: number }>>({
    whiteNoise: { playing: false, volume: 0.5 },
    rain: { playing: false, volume: 0.5 },
    forest: { playing: false, volume: 0.5 },
  });
  
  const refs = useRef<Record<SoundType, { source: AudioBufferSourceNode; gain: GainNode } | null>>({
    whiteNoise: null,
    rain: null,
    forest: null,
  });
  
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const toggleSound = useCallback((type: SoundType) => {
    const state = sounds[type];
    const ctx = getCtx();
    
    if (state.playing && refs.current[type]) {
      refs.current[type]!.source.stop();
      refs.current[type] = null;
      setSounds(prev => ({ ...prev, [type]: { ...prev[type], playing: false } }));
    } else {
      const buffer = createNoiseBuffer(ctx, type);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      const gain = ctx.createGain();
      gain.gain.value = state.volume;
      
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      
      refs.current[type] = { source, gain };
      setSounds(prev => ({ ...prev, [type]: { ...prev[type], playing: true } }));
    }
  }, [sounds, getCtx]);

  const updateVolume = useCallback((type: SoundType, vol: number) => {
    if (refs.current[type]) {
      refs.current[type]!.gain.gain.value = vol;
    }
    setSounds(prev => ({ ...prev, [type]: { ...prev[type], volume: vol } }));
  }, []);

  useEffect(() => {
    return () => {
      Object.values(refs.current).forEach(s => {
        if (s) { s.source.stop(); s.source.disconnect(); s.gain.disconnect(); }
      });
    };
  }, []);

  const accent = "var(--theme-accent)";
  const text = "var(--theme-text)";
  const secondary = "var(--theme-secondary)";
  const border = "var(--theme-border)";

  return (
    <div className="flex flex-col gap-4 w-full px-4">
      <h2 className="text-lg font-semibold" style={{ color: text }}>Ambient Sesler</h2>
      
      {SOUNDS.map((sound) => {
        const state = sounds[sound.id];
        return (
          <div
            key={sound.id}
            className="flex items-center gap-4 rounded-xl p-4"
            style={{ backgroundColor: secondary, border: `1px solid ${border}` }}
          >
            <button
              onClick={() => toggleSound(sound.id)}
              className="w-12 h-12 rounded-full flex items-center justify-center min-h-44 min-w-44"
              style={{
                backgroundColor: state.playing ? accent : "transparent",
                border: `2px solid ${accent}`,
                color: state.playing ? "#fff" : accent,
              }}
            >
              {state.playing ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              )}
            </button>
            
            <div className="flex-1">
              <div className="text-sm font-medium mb-2" style={{ color: text }}>{sound.label}</div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={state.volume}
                onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                className="w-full accent"
                style={{ accentColor: accent }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
