/**
 * 8-Bit Retro Mario Chiptune Sound Synthesizer
 * Uses Web Audio API - 100% zero external audio files, works offline & instant!
 */

class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.listeners = [];
  }

  // Subscribe to audio state changes (for UI sync across screens)
  onChange(fn) {
    if (typeof fn === 'function') {
      this.listeners.push(fn);
    }
  }

  notifyChange() {
    this.listeners.forEach((fn) => {
      try { fn(this.sfxEnabled, this.bgmPlaying); } catch (e) {}
    });
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Backward compatibility getter/setter for isMuted
  get isMuted() {
    return !this.sfxEnabled;
  }

  set isMuted(val) {
    this.sfxEnabled = !val;
  }

  toggleMute() {
    return this.toggleSFX();
  }

  // Toggle Sound Effects (Soundboard)
  toggleSFX() {
    this.init();
    this.sfxEnabled = !this.sfxEnabled;
    this.notifyChange();
    return this.sfxEnabled;
  }

  // Toggle Background Music
  toggleBGM() {
    this.init();
    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  startBGM() {
    this.init();
    // Stop any existing loop first to prevent duplicate timers
    this.stopBGM();

    this.bgmPlaying = true;
    this.bgmStep = 0;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        if (this.bgmPlaying) {
          this.runBgmStep();
        }
      }).catch(() => {});
    } else {
      this.runBgmStep();
    }

    this.notifyChange();
    return true;
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.notifyChange();
    return false;
  }

  runBgmStep() {
    if (!this.bgmPlaying) return;

    // Mario classic Overworld main motif
    const melody = [
      659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0, 783.99, 0, 0, 0, 392.00, 0, 0, 0,
      523.25, 0, 0, 392.00, 0, 0, 329.63, 0, 0, 440.00, 0, 493.88, 0, 466.16, 440.00, 0,
      392.00, 659.25, 783.99, 880.00, 0, 698.46, 783.99, 0, 659.25, 0, 523.25, 587.33, 493.88, 0
    ];

    const tempo = 150; // ms per 16th step

    const freq = melody[this.bgmStep % melody.length];
    if (freq > 0) {
      this.playToneRaw(freq, 0.12, 'square', 0.065, 0.001);
    }
    this.bgmStep++;

    this.bgmTimer = setTimeout(() => {
      this.runBgmStep();
    }, tempo);
  }

  // Raw tone synthesizer that plays independently of SFX mute state (for BGM)
  playToneRaw(freq, duration, type = 'square', startGain = 0.08, endGain = 0.001) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(startGain, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endGain), now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  // Soundboard SFX Tone Helper (respects sfxEnabled)
  playTone(freq, duration, type = 'square', startGain = 0.15, endGain = 0.001) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(startGain, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endGain), now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  // Mario Jump Sound (Frequency ramp up)
  playJump() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  // Coin Sound (Classic B5 -> E6 double ping)
  playCoin() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.25, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  // Powerup / Placement Correct Sound
  playPowerup() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.08, 'triangle', 0.2);
      }, idx * 60);
    });
  }

  // Warp Pipe Sound (Deep descent)
  playPipe() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // Error / Hit Obstacle / Bug Sound
  playBump() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  // Game Over / Disaster Fail Sound
  playFail() {
    if (!this.sfxEnabled) return;
    this.init();
    const notes = [
      { f: 500, d: 0.15 },
      { f: 400, d: 0.15 },
      { f: 300, d: 0.18 },
      { f: 220, d: 0.35 }
    ];
    let time = 0;
    notes.forEach((n) => {
      setTimeout(() => {
        this.playTone(n.f, n.d, 'sawtooth', 0.2);
      }, time * 1000);
      time += n.d;
    });
  }

  // Course Clear / Victory Fanfare (Mario Stage Clear)
  playVictory() {
    if (!this.sfxEnabled) return;
    this.init();
    const fanfare = [
      { f: 392, d: 0.1 },  // G4
      { f: 523, d: 0.1 },  // C5
      { f: 659, d: 0.1 },  // E5
      { f: 784, d: 0.15 }, // G5
      { f: 659, d: 0.1 },
      { f: 784, d: 0.3 },
      { f: 1046, d: 0.5 }  // C6
    ];
    let delay = 0;
    fanfare.forEach((n) => {
      setTimeout(() => {
        this.playTone(n.f, n.d, 'square', 0.25);
      }, delay);
      delay += n.d * 1000 + 30;
    });
  }

  // Quick UI Click
  playClick() {
    this.playTone(600, 0.04, 'square', 0.1);
  }

  // Timer Tick (warning)
  playTick() {
    this.playTone(800, 0.05, 'triangle', 0.12);
  }
}

// Global audio singleton
window.retroAudio = new RetroAudioEngine();
