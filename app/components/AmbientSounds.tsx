"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type SoundType = "whiteNoise" | "rain" | "forest";

const SOUNDS: { id: SoundType; label: string; icon: string }[] = [
  { id: "whiteNoise", label: "Beyaz Gürültü", icon: "🌊" },
  { id: "rain", label: "Yağmur Sesi", icon: "🌧️" },
  { id: "forest", label: "Derin Orman", icon: "🌲" },
];

// Advanced Audio Generation Algorithms
function createNoiseBuffer(ctx: AudioContext, type: SoundType) {
  const rate = ctx.sampleRate;
  const length = rate * 2;
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  
  let lastOut = 0; // For Pink/Brown noise filtering

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    
    if (type === "whiteNoise") {
      data[i] = white * 0.15; // Pure white noise
    } else if (type === "rain") {
      // Brown/Pink noise hybrid for rain feel
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 1.5; 
    } else if (type === "forest") {
      // Very low frequency movement for wind/forest depth
      const t = i / rate;
      const wind = Math.sin(t * 0.2) * 0.05;
      lastOut = (lastOut + (0.01 * white)) / 1.01;
      data[i] = (lastOut + wind) * 0.8;
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
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const toggleSound = useCallback((type: SoundType) => {
    const state = sounds[type];
    const ctx = getCtx();
    
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    
    if (state.playing && refs.current[type]) {
      const { source, gain } = refs.current[type]!;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      setTimeout(() => {
        source.stop();
        source.disconnect();
        gain.disconnect();
      }, 500);
      refs.current[type] = null;
      setSounds(prev => ({ ...prev, [type]: { ...prev[type], playing: false } }));
    } else {
      const buffer = createNoiseBuffer(ctx, type);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      const gain = ctx.createGain();
      gain.gain.value = 0.001;
      
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      
      gain.gain.exponentialRampToValueAtTime(state.volume, ctx.currentTime + 0.5);
      
      refs.current[type] = { source, gain };
      setSounds(prev => ({ ...prev, [type]: { ...prev[type], playing: true } }));
    }
  }, [sounds, getCtx]);

  const updateVolume = useCallback((type: SoundType, vol: number) => {
    const ctx = getCtx();
    if (refs.current[type]) {
      refs.current[type]!.gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1);
    }
    setSounds(prev => ({ ...prev, [type]: { ...prev[type], volume: vol } }));
  }, [getCtx]);

  useEffect(() => {
    return () => {
      Object.values(refs.current).forEach(s => {
        if (s) { s.source.stop(); s.source.disconnect(); s.gain.disconnect(); }
      });
    };
  }, []);

  return (
    <div className="sounds-wrapper animate-in">
      <div className="theme-list">
        {SOUNDS.map((sound) => {
          const state = sounds[sound.id];
          return (
            <div key={sound.id} className={`sound-card ${state.playing ? "active" : ""}`}>
              <button
                onClick={() => toggleSound(sound.id)}
                className={`sound-toggle ${state.playing ? "active" : ""}`}
              >
                <span className="sound-icon">{state.playing ? "⏸" : "▶"}</span>
              </button>
              
              <div className="sound-info">
                <div className="theme-info">
                  <span className="theme-name">{sound.icon} {sound.label}</span>
                  <span className="theme-desc">{state.playing ? "Şu an çalıyor..." : "Dinlemek için bas"}</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="1"
                  step="0.01"
                  value={state.volume}
                  onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                  className="sound-slider"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
