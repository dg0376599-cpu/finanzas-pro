function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
    setTimeout(() => ctx.close(), (dur + 0.2) * 1000);
  } catch {}
}

export function playSuccess() {
  tone(523, 0.1);
  setTimeout(() => tone(659, 0.1), 100);
  setTimeout(() => tone(784, 0.22), 200);
}

export function playDelete() {
  tone(280, 0.18, 'sawtooth', 0.1);
}

export function playClick() {
  tone(900, 0.06, 'sine', 0.07);
}
