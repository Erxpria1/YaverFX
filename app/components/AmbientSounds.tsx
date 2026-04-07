"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type SoundType = "whiteNoise" | "rain" | "forest";

interface SoundConfig {
  id: SoundType;
  label: string;
  icon: React.ReactNode;
}

const SOUNDS: SoundConfig[] = [
  {
    id: "whiteNoise",
    label: "White Noise",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h2M6 8v8M10 4v16M14 8v8M18 6v12M22 12h-2" />
      </svg>
    ),
  },
  {
    id: "rain",
    label: "Rain",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M16 14v6M8 14v6M12 16v6" />
      </svg>
    ),
  },
  {
    id: "forest",
    label: "Forest",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 14l3-3-3-3" />
        <path d="M7 14l-3-3 3-3" />
        <path d="M12 2v8" />
        <path d="M12 10c-2 2-4 4-4 7a4 4 0 0 0 8 0c0-3-2-5-4-7" />
      </svg>
    ),
  },
];

function createWhiteNoiseBuffer(ctx: AudioContext, duration = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createRainBuffer(ctx: AudioContext, duration = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  return buffer;
}

function createForestBuffer(ctx: AudioContext, duration = 4): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const noise = Math.random() * 2 - 1;
    const wind = Math.sin(t * 0.5) * 0.1 + Math.sin(t * 1.3) * 0.05;
    const bird1 = Math.sin(t * 2800 + Math.sin(t * 8) * 200) * 0.02 * (Math.sin(t * 0.7) > 0.3 ? 1 : 0);
    const bird2 = Math.sin(t * 3500 + Math.sin(t * 12) * 300) * 0.015 * (Math.sin(t * 1.1 + 2) > 0.5 ? 1 : 0);
    const rustle = noise * 0.03 * (0.5 + 0.5 * Math.sin(t * 3));
    data[i] = wind + bird1 + bird2 + rustle;
  }
  return buffer;
}

interface SoundState {
  isPlaying: boolean;
  volume: number;
}

export default function AmbientSounds() {
  const [sounds, setSounds] = useState<Record<SoundType, SoundState>>({
    whiteNoise: { isPlaying: false, volume: 0.5 },
    rain: { isPlaying: false, volume: 0.5 },
    forest: { isPlaying: false, volume: 0.5 },
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Record<SoundType, { source: AudioBufferSourceNode; gain: GainNode } | null>>({
    whiteNoise: null,
    rain: null,
    forest: null,
  });

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const ctx = getAudioContext();
    const existing = sourcesRef.current[type];
    if (existing) return;

    let buffer: AudioBuffer;
    switch (type) {
      case "whiteNoise":
        buffer = createWhiteNoiseBuffer(ctx);
        break;
      case "rain":
        buffer = createRainBuffer(ctx);
        break;
      case "forest":
        buffer = createForestBuffer(ctx);
        break;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = sounds[type].volume;

    if (type === "rain") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;
      source.connect(filter);
      filter.connect(gainNode);
    } else if (type === "forest") {
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2000;
      filter.Q.value = 0.5;
      source.connect(filter);
      filter.connect(gainNode);
    } else {
      source.connect(gainNode);
    }

    gainNode.connect(ctx.destination);
    source.start();

    sourcesRef.current[type] = { source, gain: gainNode };
    setSounds((prev) => ({ ...prev, [type]: { ...prev[type], isPlaying: true } }));
  }, [getAudioContext, sounds]);

  const stopSound = useCallback((type: SoundType) => {
    const existing = sourcesRef.current[type];
    if (!existing) return;

    existing.source.stop();
    existing.source.disconnect();
    existing.gain.disconnect();
    sourcesRef.current[type] = null;
    setSounds((prev) => ({ ...prev, [type]: { ...prev[type], isPlaying: false } }));
  }, []);

  const toggleSound = useCallback((type: SoundType) => {
    if (sounds[type].isPlaying) {
      stopSound(type);
    } else {
      playSound(type);
    }
  }, [sounds, playSound, stopSound]);

  const updateVolume = useCallback((type: SoundType, volume: number) => {
    const existing = sourcesRef.current[type];
    if (existing) {
      existing.gain.gain.value = volume;
    }
    setSounds((prev) => ({ ...prev, [type]: { ...prev[type], volume } }));
  }, []);

  useEffect(() => {
    return () => {
      Object.values(sourcesRef.current).forEach((s) => {
        if (s) {
          s.source.stop();
          s.source.disconnect();
          s.gain.disconnect();
        }
      });
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Ambient Sounds</h2>

      <div className="flex flex-col gap-3">
        {SOUNDS.map((sound) => {
          const state = sounds[sound.id];
          return (
            <div key={sound.id} className="flex items-center gap-4">
              <button
                onClick={() => toggleSound(sound.id)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                  state.isPlaying
                    ? "bg-zinc-100 text-zinc-900 hover:bg-white"
                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
                aria-label={`${state.isPlaying ? "Pause" : "Play"} ${sound.label}`}
              >
                {state.isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                )}
              </button>

              <span className={`w-24 shrink-0 text-sm font-medium transition-colors ${state.isPlaying ? "text-zinc-100" : "text-zinc-500"}`}>
                {sound.label}
              </span>

              <div className="flex flex-1 items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-zinc-600">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  {state.volume > 0.3 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
                  {state.volume > 0.6 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.volume}
                  onChange={(e) => updateVolume(sound.id, parseFloat(e.target.value))}
                  className="flex-1 accent-zinc-400"
                  aria-label={`${sound.label} volume`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
