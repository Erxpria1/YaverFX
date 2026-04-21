/**
 * PixelSound — 8-bit style sound effects via Web Audio API.
 * No external audio files needed.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    ctx = new AudioContextClass();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Square-wave beep (menu click / UI feedback) */
export function playPixelClick(volume = 0.08): void {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(880, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.05);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.08);
  } catch {}
}

/** Lower beep (start timer) */
export function playPixelStart(volume = 0.1): void {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = "square";
    // Rising two-tone
    osc.frequency.setValueAtTime(523, c.currentTime); // C5
    osc.frequency.setValueAtTime(659, c.currentTime + 0.08); // E5
    osc.frequency.setValueAtTime(784, c.currentTime + 0.16); // G5
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.28);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.28);
  } catch {}
}

/** Descending tone (pause) */
export function playPixelPause(volume = 0.08): void {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(440, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(330, c.currentTime + 0.1);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.15);
  } catch {}
}

/** Victory fanfare (timer complete) */
export function playPixelComplete(volume = 0.12): void {
  try {
    const c = getCtx();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      const t = c.currentTime + i * 0.14;
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch {}
}

/** Coin / level-up sound (task done) */
export function playPixelCoin(volume = 0.1): void {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(988, c.currentTime); // B5
    osc.frequency.setValueAtTime(1319, c.currentTime + 0.06); // E6
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.18);
  } catch {}
}
