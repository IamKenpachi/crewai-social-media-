/**
 * Web Audio API synthesizer & media player for background music playback and real-time audio ducking demonstration.
 * Supports playing actual audio buffers (from Lyria/audio URLs) or algorithmic synth with WebAudio ducking gain nodes.
 */

class MusicSynthesizerEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private bpm: number = 124;
  private duckingGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private duckingVolume: number = 0.22;
  private isDuckingActive: boolean = false;
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGainNode = this.ctx.createGain();
      this.duckingGainNode = this.ctx.createGain();
      this.duckingGainNode.gain.setValueAtTime(this.isDuckingActive ? this.duckingVolume : 0.8, this.ctx.currentTime);
      this.duckingGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(60, Math.min(180, newBpm));
  }

  public setDucking(enabled: boolean, duckingLevel: number = 0.22) {
    this.isDuckingActive = enabled;
    this.duckingVolume = duckingLevel;
    if (this.ctx && this.duckingGainNode) {
      const target = enabled ? duckingLevel : 0.85;
      this.duckingGainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public setMasterVolume(vol: number) {
    if (this.ctx && this.masterGainNode) {
      this.masterGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.02);
    }
  }

  public start(mood: string = 'energetic', bpm: number = 124, audioUrl?: string) {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.bpm = bpm;

    // If audioUrl is provided and points to actual audio data (data: or http/wav/mp3)
    if (audioUrl && (audioUrl.startsWith('data:audio/') || audioUrl.startsWith('http') || audioUrl.endsWith('.mp3') || audioUrl.endsWith('.wav'))) {
      try {
        if (!this.audioElement) {
          this.audioElement = new Audio();
          this.audioElement.loop = true;
          this.audioElement.crossOrigin = 'anonymous';
          if (this.ctx && this.duckingGainNode) {
            this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
            this.audioSourceNode.connect(this.duckingGainNode);
          }
        }
        
        if (this.audioElement.src !== audioUrl) {
          this.audioElement.src = audioUrl;
          this.audioElement.load();
        }
        
        this.audioElement.play().catch((err) => {
          console.warn('Audio element play fallback to synth:', err);
          this.startAlgorithmicSynth(mood, bpm);
        });
        return;
      } catch (err) {
        console.warn('Error setting up HTMLAudioElement WebAudio node:', err);
      }
    }

    this.startAlgorithmicSynth(mood, bpm);
  }

  private startAlgorithmicSynth(mood: string, bpm: number) {
    let step = 0;
    const intervalMs = (60 / this.bpm / 4) * 1000; // 16th note interval
    const chords = this.getScaleForMood(mood);

    this.timerId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.duckingGainNode) return;
      const now = this.ctx.currentTime;

      // 4-on-the-floor kick on beat 0, 4, 8, 12
      if (step % 4 === 0) {
        this.playKick(now);
      }

      // Snare / clap on beat 4, 12
      if (step % 8 === 4) {
        this.playSnare(now);
      }

      // Hi-hat on every 8th note
      if (step % 2 === 0) {
        this.playHiHat(now, step % 4 === 2);
      }

      // Synth Bassline / Arpeggio
      const noteIdx = (step % chords.length);
      const freq = chords[noteIdx];
      this.playSynthNote(freq, now, 0.15);

      step = (step + 1) % 16;
    }, intervalMs);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) {}
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private getScaleForMood(mood: string): number[] {
    const lower = (mood || '').toLowerCase();
    if (lower.includes('chill') || lower.includes('lo-fi') || lower.includes('jazz') || lower.includes('downtempo')) {
      return [293.66, 349.23, 440.00, 523.25, 392.00, 466.16, 587.33, 698.46];
    }
    if (lower.includes('action') || lower.includes('adrenaline') || lower.includes('rock')) {
      return [164.81, 196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00];
    }
    if (lower.includes('space') || lower.includes('ambient') || lower.includes('orchestral')) {
      return [220.00, 261.63, 329.63, 415.30, 440.00, 523.25, 659.25, 830.61];
    }
    return [185.00, 220.00, 277.18, 370.00, 293.66, 349.23, 440.00, 554.37];
  }

  private playKick(time: number) {
    if (!this.ctx || !this.duckingGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.duckingGainNode);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.duckingGainNode) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckingGainNode);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.11);
  }

  private playHiHat(time: number, open: boolean = false) {
    if (!this.ctx || !this.duckingGainNode) return;
    const dur = open ? 0.08 : 0.03;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.2 : 0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckingGainNode);

    noise.start(time);
    noise.stop(time + dur + 0.01);
  }

  private playSynthNote(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.duckingGainNode) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + dur);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.duckingGainNode);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  public getAudioContext(): AudioContext {
    this.init();
    return this.ctx!;
  }

  public getMasterGainNode(): GainNode {
    this.init();
    return this.masterGainNode!;
  }

  /**
   * Render an offline AudioBuffer of the procedural generated soundtrack
   */
  public async renderOfflineAudioBuffer(mood: string = 'energetic', bpm: number = 124, durationSeconds: number = 15): Promise<AudioBuffer> {
    const sampleRate = 44100;
    const totalSamples = sampleRate * durationSeconds;
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtx(2, totalSamples, sampleRate);

    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.9, 0);
    masterGain.connect(offlineCtx.destination);

    const chords = this.getScaleForMood(mood);
    const intervalSec = 60 / bpm / 4; // 16th note
    const totalSteps = Math.floor(durationSeconds / intervalSec);

    for (let step = 0; step < totalSteps; step++) {
      const time = step * intervalSec;

      // 4-on-the-floor kick
      if (step % 4 === 0) {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(time);
        osc.stop(time + 0.16);
      }

      // Snare on 4, 12
      if (step % 8 === 4) {
        const bufferSize = Math.floor(sampleRate * 0.1);
        const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = offlineCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        const gain = offlineCtx.createGain();
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(time);
        noise.stop(time + 0.11);
      }

      // Hi-hat on 8th notes
      if (step % 2 === 0) {
        const isOpen = step % 4 === 2;
        const dur = isOpen ? 0.08 : 0.03;
        const bufferSize = Math.floor(sampleRate * dur);
        const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = offlineCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        const gain = offlineCtx.createGain();
        gain.gain.setValueAtTime(isOpen ? 0.25 : 0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(time);
        noise.stop(time + dur + 0.01);
      }

      // Synth Arp
      const noteIdx = step % chords.length;
      const freq = chords[noteIdx];
      const osc = offlineCtx.createOscillator();
      const filter = offlineCtx.createBiquadFilter();
      const gain = offlineCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.frequency.exponentialRampToValueAtTime(400, time + 0.15);
      gain.gain.setValueAtTime(0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + 0.17);
    }

    return await offlineCtx.startRendering();
  }
}

export const musicSynth = new MusicSynthesizerEngine();
