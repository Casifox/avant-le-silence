/**
 * Ambiance sonore discrète, entièrement synthétisée avec la Web Audio API.
 * Aucun fichier audio externe, aucune voix artificielle.
 * Le son ne démarre qu'après une interaction du joueur.
 */

const MOODS = {
  default: [146.83, 220.0, 329.63],
  day: [196.0, 293.66, 392.0],
  solemn: [130.81, 196.0, 261.63],
  memory: [174.61, 261.63, 349.23]
};

export class AudioSystem {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.ctx = null;
    this.master = null;
    this.ambientBus = null;
    this.sfxBus = null;
    this.ambientFilter = null;
    this.oscillators = [];
    this.noiseSource = null;
    this.noiseBuffer = null;
    this.mood = "default";
    this.started = false;
    this.muted = Boolean(stateManager.get().preferences.muted);
  }

  async start() {
    if (this.started) {
      if (this.ctx?.state === "suspended") {
        try {
          await this.ctx.resume();
        } catch {
          /* le navigateur peut refuser hors interaction */
        }
      }
      return true;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    try {
      this.ctx = new AudioContextClass();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);

      this.ambientBus = this.ctx.createGain();
      this.ambientBus.gain.value = 0.5;
      this.ambientBus.connect(this.master);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.4;
      this.sfxBus.connect(this.master);

      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = "lowpass";
      this.ambientFilter.frequency.value = 720;
      this.ambientFilter.Q.value = 0.4;
      this.ambientFilter.connect(this.ambientBus);

      const gains = [0.15, 0.1, 0.065];
      const types = ["sine", "sine", "triangle"];
      const base = MOODS[this.mood] || MOODS.default;

      this.oscillators = base.map((frequency, index) => {
        const oscillator = this.ctx.createOscillator();
        oscillator.type = types[index];
        oscillator.frequency.value = frequency;
        const gain = this.ctx.createGain();
        gain.gain.value = gains[index];
        oscillator.connect(gain).connect(this.ambientFilter);
        oscillator.start();
        return { oscillator, gain };
      });

      this.noiseBuffer = this.createNoiseBuffer(2.5);
      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = this.noiseBuffer;
      this.noiseSource.loop = true;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 380;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.012;
      this.noiseSource.connect(noiseFilter).connect(noiseGain).connect(this.ambientBus);
      this.noiseSource.start();

      this.started = true;
      this.applyPreferences(this.stateManager.get().preferences);
      if (this.ctx.state === "suspended") {
        try {
          await this.ctx.resume();
        } catch {
          /* le contexte reste suspendu tant que le navigateur l'exige */
        }
      }
      return true;
    } catch (error) {
      console.warn("[AVANT LE SILENCE] Audio indisponible", error);
      return false;
    }
  }

  createNoiseBuffer(seconds) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    return buffer;
  }

  setMood(mood) {
    this.mood = MOODS[mood] ? mood : "default";
    if (!this.ctx || !this.started) return;
    const frequencies = MOODS[this.mood];
    const now = this.ctx.currentTime;
    this.oscillators.forEach(({ oscillator }, index) => {
      oscillator.frequency.setTargetAtTime(frequencies[index], now, 1.4);
    });
  }

  applyPreferences(preferences) {
    this.muted = Boolean(preferences.muted);
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const music = this.muted ? 0 : Number(preferences.music ?? 0.32);
    const sfx = this.muted ? 0 : Number(preferences.sfx ?? 0.5);
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, now, 0.06);
    this.ambientBus.gain.setTargetAtTime(0.62 * music, now, 0.35);
    this.sfxBus.gain.setTargetAtTime(0.55 * sfx, now, 0.05);
  }

  play(name) {
    if (!this.ctx || !this.started || this.muted) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    const now = this.ctx.currentTime;
    switch (name) {
      case "click":
        this.tone(660, 540, 0.06, 0.08, "triangle", now);
        break;
      case "open":
        this.tone(392, 523.25, 0.13, 0.07, "sine", now);
        break;
      case "close":
        this.tone(523.25, 392, 0.11, 0.06, "sine", now);
        break;
      case "page":
        this.noise(0.14, 0.05, 1400, now);
        break;
      case "confirm":
        this.tone(523.25, 523.25, 0.16, 0.08, "sine", now);
        this.tone(783.99, 783.99, 0.22, 0.07, "sine", now + 0.09);
        break;
      case "warn":
        this.tone(220, 196, 0.2, 0.07, "sine", now);
        break;
      default:
        break;
    }
  }

  tone(from, to, duration, gain, type, startAt) {
    const oscillator = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), startAt + duration);
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(gain, startAt + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(envelope).connect(this.sfxBus);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  }

  noise(duration, gain, frequency, startAt) {
    if (!this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 0.8;
    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(gain, startAt + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    source.connect(filter).connect(envelope).connect(this.sfxBus);
    source.start(startAt);
    source.stop(startAt + duration + 0.03);
  }
}
