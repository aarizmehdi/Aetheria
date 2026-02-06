

class AudioService {
  private ctx: AudioContext | null = null;
  private rainNode: GainNode | null = null;
  private windNode: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }


  public async init() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.4;
    }
  }

  private createPinkNoise() {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    return noise;
  }

  public playWeatherSound(condition: string) {
    this.stopAll();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const lowerCond = condition.toLowerCase();


    if (lowerCond.includes('rain') || lowerCond.includes('drizzle') || lowerCond.includes('thunder')) {
      const noise = this.createPinkNoise();
      if (!noise) return;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.value = 800;

      this.rainNode = this.ctx.createGain();
      this.rainNode.gain.value = 0;

      noise.connect(rainFilter);
      rainFilter.connect(this.rainNode);
      this.rainNode.connect(this.masterGain);

      noise.start();


      this.rainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2);
    }


    if (lowerCond.includes('cloud') || lowerCond.includes('clear') || lowerCond.includes('wind') || lowerCond.includes('snow')) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 400;
      windFilter.Q.value = 10;

      this.windNode = this.ctx.createGain();
      this.windNode.gain.value = 0;

      noise.connect(windFilter);
      windFilter.connect(this.windNode);
      this.windNode.connect(this.masterGain);

      noise.start();


      const now = this.ctx.currentTime;
      this.windNode.gain.linearRampToValueAtTime(0.05, now + 2);


      windFilter.frequency.setValueAtTime(400, now);
      windFilter.frequency.linearRampToValueAtTime(600, now + 4);
      windFilter.frequency.linearRampToValueAtTime(300, now + 8);
    }
  }

  public playThunder() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }

  public stopAll() {
    if (this.rainNode) {
      try { this.rainNode.disconnect(); } catch (e) { }
      this.rainNode = null;
    }
    if (this.windNode) {
      try { this.windNode.disconnect(); } catch (e) { }
      this.windNode = null;
    }
  }

  public toggleMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.4, this.ctx?.currentTime || 0, 0.1);
    }
  }
}


let lastOut = 0;

export const audioService = new AudioService();