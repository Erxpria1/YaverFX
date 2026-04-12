export type NotificationSoundId = "default" | "clinicalbell" | "chime" | "forest" | "rain" | "waves";

export interface SoundOption {
  id: NotificationSoundId;
  label: string;
  icon: string;
  description: string;
}

export const NOTIFICATION_SOUNDS: SoundOption[] = [
  { id: "default", label: "Varsayılan", icon: "🔔", description: "Klasik bip sesi" },
  { id: "clinicalbell", label: "Klinik Zil", icon: "🔔", description: "Hastane zili gibi" },
  { id: "chime", label: "Çan", icon: "🎐", description: "Yumuşak çan sesi" },
  { id: "forest", label: "Orman", icon: "🌲", description: "Kuş sesli orman" },
  { id: "rain", label: "Yağmur", icon: "🌧️", description: "Hafif yağmur" },
  { id: "waves", label: "Dalgalar", icon: "🌊", description: "Deniz dalgaları" },
];

// Free sound URLs (using public CDNs)
const SOUND_URLS: Record<NotificationSoundId, string | null> = {
  default: null, // use synthesized sound
  clinicalbell: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Doorbell-rung-1.ogg",
  chime: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Bell-ringing-animation.gif",
  forest: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Kakadu_-_bird_in_rain.ogg",
  rain: "https://upload.wikimedia.org/wikipedia/commons/0/05/Rain_Sounds.ogg",
  waves: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Waves_-_geograph.org_.jpg",
};

function getStoredSoundId(): NotificationSoundId {
  if (typeof window === "undefined") return "default";
  return (localStorage.getItem("yaverfx-notification-sound") as NotificationSoundId) || "default";
}

export function setStoredSoundId(id: NotificationSoundId) {
  if (typeof window === "undefined") return;
  localStorage.setItem("yaverfx-notification-sound", id);
}

// Synthesized default notification sound
function playSynthDefault() {
  try {
    // @ts-expect-error - webkitAudioContext is non-standard
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audioContext = new AudioCtx();
    const playNote = (freq: number, start: number, dur: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(freq, start);
      osc.type = "sine";
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.start(start);
      osc.stop(start + dur);
    };
    const now = audioContext.currentTime;
    playNote(523.25, now, 0.4);     // C5
    playNote(659.25, now + 0.15, 0.4); // E5
    playNote(783.99, now + 0.3, 0.5);  // G5
    playNote(1046.5, now + 0.5, 0.7);  // C6
  } catch (e) {
    console.warn("Audio context failed", e);
  }
}

// Play clinical bell sound (synthesized - two tone chime)
function playClinicalBell() {
  try {
    // @ts-expect-error - webkitAudioContext is non-standard
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Metallic bell with harmonics
    const frequencies = [440, 880, 1320, 1760]; // A4 and harmonics
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now);
      osc.type = "sine";
      const vol = 0.15 / (i + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
    });
  } catch (e) {
    console.warn("Audio context failed", e);
  }
}

// Play chime sound (soft bell)
function playChime() {
  try {
    // @ts-expect-error - webkitAudioContext is non-standard
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Single pure tone with decay
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, now); // A5
    osc.type = "sine";
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.start(now);
    osc.stop(now + 0.8);

    // Second higher tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(1318.5, now + 0.1); // E6
    osc2.type = "sine";
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc2.start(now);
    osc2.stop(now + 1.0);
  } catch (e) {
    console.warn("Audio context failed", e);
  }
}

// Play forest ambience (synthesized wind + birds)
function playForest() {
  try {
    // @ts-expect-error - webkitAudioContext is non-standard
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Wind noise (filtered white noise)
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 0.8;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);

    // Bird chirps (short high freq bursts)
    [0.2, 0.4, 0.6].forEach(delay => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.setValueAtTime(2000 + Math.random() * 1000, now + delay);
      osc.frequency.exponentialRampToValueAtTime(1500, now + delay + 0.1);
      g.gain.setValueAtTime(0, now + delay);
      g.gain.linearRampToValueAtTime(0.08, now + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
      osc.start(now + delay);
      osc.stop(now + delay + 0.15);
    });
  } catch (e) {
    console.warn("Audio context failed", e);
  }
}

// Play rain sound (filtered brown noise)
function playRain() {
  try {
    // @ts-expect-error - webkitAudioContext is non-standard
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 2.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.setValueAtTime(0.2, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  } catch (e) {
    console.warn("Audio context failed", e);
  }
}

// Play waves sound (filtered noise with slow modulation)
function playWaves() {
  try {
    // @ts-expect-error - webkitAudioContext is non-standard
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.01 * white)) / 1.01;
      data[i] = lastOut * 1.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, now);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.3, now);
    lfoGain.gain.setValueAtTime(200, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    gain.gain.linearRampToValueAtTime(0.15, now + 1.5);
    gain.gain.linearRampToValueAtTime(0.2, now + 2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 4);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    lfo.start(now);
    lfo.stop(now + 4);
  } catch (e) {
    console.warn("Audio context failed", e);
  }
}

// Main play function - dispatches to appropriate handler
export function playNotificationSound(soundId?: NotificationSoundId): void {
  if (typeof window === "undefined") return;
  const id = soundId || getStoredSoundId();

  switch (id) {
    case "clinicalbell":
      playClinicalBell();
      break;
    case "chime":
      playChime();
      break;
    case "forest":
      playForest();
      break;
    case "rain":
      playRain();
      break;
    case "waves":
      playWaves();
      break;
    case "default":
    default:
      playSynthDefault();
      break;
  }
}

// Legacy export for backwards compatibility
export { playNotificationSound as playNotificationSoundOriginal };