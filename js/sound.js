// A quiet, local two-note cue. No audio assets or network requests.
export function createSound({ AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext } = {}) {
  let enabled = true;
  let context;
  return {
    get enabled() { return enabled; },
    toggle() { enabled = !enabled; return enabled; },
    play() {
      if (!enabled || !AudioContextClass) return false;
      try {
        context ??= new AudioContextClass();
        if (context.state === 'suspended') void context.resume();
        const at = context.currentTime;
        for (const [index, frequency] of [440, 554].entries()) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'sine'; oscillator.frequency.value = frequency;
          const start = at + index * 0.085;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.035, start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
          oscillator.connect(gain); gain.connect(context.destination);
          oscillator.start(start); oscillator.stop(start + 0.15);
        }
        return true;
      } catch { return false; }
    },
  };
}
