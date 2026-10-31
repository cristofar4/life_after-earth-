/**
 * Ambient audio engine.
 * - If MEDIA.audio.ambient is supplied, that file loops through the graph.
 * - Otherwise ambience is synthesised live: filtered wind, soft water and
 *   occasional distant bird calls. It is real audio, generated in the browser.
 * An AnalyserNode drives the on-screen waveforms from actual playback.
 */
export class AmbientAudio {
  constructor(src = null) {
    this.src = src;
    this.ctx = null;
    this.master = null;
    this.analyser = null;
    this.playing = false;
    this.birdTimer = null;
    this.listeners = new Set();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    this.listeners.forEach((fn) => fn(this.playing));
  }

  build() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) throw new Error('Web Audio is not supported');
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.82;
    this.master.connect(this.analyser);
    this.analyser.connect(ctx.destination);
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);

    if (this.src) {
      this.el = new Audio(this.src);
      this.el.loop = true;
      this.el.crossOrigin = 'anonymous';
      ctx.createMediaElementSource(this.el).connect(this.master);
      return;
    }

    // --- Wind: brown noise, slowly breathing low-pass -----------------------
    const noise = (seconds, brown) => {
      const len = ctx.sampleRate * seconds;
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        let last = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          if (brown) {
            last = (last + 0.02 * w) / 1.02;
            d[i] = last * 3.2;
          } else d[i] = w;
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.loop = true;
      return s;
    };
    const lfo = (freq, depth, target) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      g.gain.value = depth;
      o.connect(g).connect(target);
      o.start();
    };

    const wind = noise(6, true);
    const windLp = ctx.createBiquadFilter();
    windLp.type = 'lowpass';
    windLp.frequency.value = 520;
    windLp.Q.value = 0.6;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.55;
    lfo(0.045, 260, windLp.frequency);
    lfo(0.07, 0.18, windGain.gain);
    wind.connect(windLp).connect(windGain).connect(this.master);
    wind.start();

    // --- Water: soft band of white noise with a slow lapping swell ----------
    const water = noise(4, false);
    const waterBp = ctx.createBiquadFilter();
    waterBp.type = 'bandpass';
    waterBp.frequency.value = 900;
    waterBp.Q.value = 0.9;
    const waterGain = ctx.createGain();
    waterGain.gain.value = 0.018;
    lfo(0.22, 0.009, waterGain.gain);
    lfo(0.11, 260, waterBp.frequency);
    water.connect(waterBp).connect(waterGain).connect(this.master);
    water.start();

    // --- Distance: a gentle feedback delay for the birds -------------------
    this.birdBus = ctx.createGain();
    this.birdBus.gain.value = 0.5;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.23;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const dampen = ctx.createBiquadFilter();
    dampen.type = 'lowpass';
    dampen.frequency.value = 2400;
    this.birdBus.connect(this.master);
    this.birdBus.connect(delay);
    delay.connect(dampen).connect(fb).connect(delay);
    dampen.connect(this.master);
  }

  chirpSeries() {
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.05;
    const count = 2 + Math.floor(Math.random() * 4);
    const base = 2600 + Math.random() * 1600;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) {
      pan.pan.value = Math.random() * 1.6 - 0.8;
      pan.connect(this.birdBus);
    }
    for (let i = 0; i < count; i++) {
      const t = t0 + i * (0.14 + Math.random() * 0.1);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * 1.45, t + 0.05);
      o.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.11);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.028, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(pan || this.birdBus);
      o.start(t);
      o.stop(t + 0.14);
    }
  }

  scheduleBirds() {
    clearTimeout(this.birdTimer);
    if (this.src || !this.playing) return;
    this.birdTimer = setTimeout(() => {
      if (!this.playing) return;
      this.chirpSeries();
      this.scheduleBirds();
    }, 3500 + Math.random() * 7000);
  }

  async start() {
    if (!this.ctx) this.build();
    await this.ctx.resume();
    if (this.el) await this.el.play();
    const g = this.master.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.85, now + 1.4);
    this.playing = true;
    this.scheduleBirds();
    this.emit();
  }

  stop() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    clearTimeout(this.birdTimer);
    const g = this.master.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 0.5);
    clearTimeout(this.suspendTimer);
    this.suspendTimer = setTimeout(() => {
      if (!this.playing) {
        this.el?.pause();
        this.ctx.suspend();
      }
    }, 600);
    this.emit();
  }

  /** Normalised 0..1 level for `bands` frequency bands, or null if silent. */
  levels(bands) {
    if (!this.analyser || !this.playing) return null;
    this.analyser.getByteFrequencyData(this.freq);
    const out = new Array(bands);
    const usable = Math.floor(this.freq.length * 0.7);
    for (let i = 0; i < bands; i++) {
      // mirror around the centre so the waveform reads symmetrically
      const k = Math.abs(i - (bands - 1) / 2) / ((bands - 1) / 2);
      const idx = Math.min(usable - 1, Math.floor(k * usable));
      out[i] = this.freq[idx] / 255;
    }
    return out;
  }
}
