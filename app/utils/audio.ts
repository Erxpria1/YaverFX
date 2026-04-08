export function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const audioContext = new AudioCtx();
    const playNote = (freq: number, start: number, dur: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.start(start);
      osc.stop(start + dur);
    };
    const now = audioContext.currentTime;
    playNote(523.25, now, 0.4);
    playNote(659.25, now + 0.15, 0.4);
    playNote(783.99, now + 0.3, 0.5);
    playNote(1046.5, now + 0.5, 0.7);
  } catch (e) {
    console.warn("Audio context failed", e);
  }
}
