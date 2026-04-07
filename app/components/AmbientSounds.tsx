"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type SoundType = "whiteNoise" | "rain" | "forest";

const SOUNDS: { id: SoundType; label: string; icon: string }[] = [
  { id: "whiteNoise", label: "Beyaz Gürültü", icon: "🌊" },
  { id: "rain", label: "Yağmur", icon: "🌧️" },
  { id: "forest", label: "Orman", icon: "🌲" },
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
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
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

  return (
    <div className="sounds-wrapper">
      <h2 className="section-title">Ambient Sesler</h2>
      
      {SOUNDS.map((sound) => {
        const state = sounds[sound.id];
        return (
          <div key={sound.id} className="sound-card">
            <button
              onClick={() => toggleSound(sound.id)}
              className={`sound-toggle ${state.playing ? "active" : ""}`}
            >
              <span className="sound-icon">{state.playing ? "⏸️" : "▶️"}</span>
            </button>
            
            <div className="sound-info">
              <div className="sound-label">
                <span className="sound-emoji">{sound.icon}</span>
                {sound.label}
              </div>
              <input
                type="range"
                min="0"
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
  );
}