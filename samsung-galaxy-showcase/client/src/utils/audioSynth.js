// Web Audio API Ambient Synthesizer for Galaxy Showcase
// Generates a futuristic, warm space drone that responds to mouse coordinates.

class AmbientSynth {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.oscillators = [];
    this.lfo = null;
    this.lfoGain = null;
    this.filter = null;
    this.delayNode = null;
    this.feedbackGain = null;
    this.isPlaying = false;

    // C Minor 9th chord frequencies (C2, G2, C3, Eb3, Bb3, D4, G4)
    this.frequencies = [65.41, 98.00, 130.81, 155.56, 233.08, 293.66, 392.00];
  }

  init() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API is not supported in this browser.");
      return false;
    }
    
    this.audioCtx = new AudioContextClass();
    return true;
  }

  start() {
    if (this.isPlaying) return;
    
    if (!this.audioCtx) {
      const success = this.init();
      if (!success) return;
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Master Gain (handles fading in and out)
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, now);
    // Smooth fade-in over 2.5 seconds
    this.masterGain.gain.linearRampToValueAtTime(0.25, now + 2.5);

    // Filter Node (Lowpass for that warm, submerged analog sound)
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(450, now);
    this.filter.Q.setValueAtTime(2.5, now);

    // LFO to modulate filter frequency (creates a "breathing" sweep)
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.12, now); // Very slow oscillation (8s period)

    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.setValueAtTime(200, now); // Sweep range (450Hz +/- 200Hz)

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);
    this.lfo.start(now);

    // Delay Feedback Loop for spaciousness
    this.delayNode = ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(0.75, now); // 750ms delay
    
    this.feedbackGain = ctx.createGain();
    this.feedbackGain.gain.setValueAtTime(0.45, now); // Generates fading echoes

    // Connect delay circuit
    this.filter.connect(this.delayNode);
    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode); // loopback
    this.feedbackGain.connect(this.masterGain); // delay output

    // Connect direct (dry) sound
    this.filter.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    // Generate oscillators for the chord notes
    this.frequencies.forEach((freq, idx) => {
      // 1. Warm base wave (Triangle)
      const oscTri = ctx.createOscillator();
      oscTri.type = 'triangle';
      oscTri.frequency.setValueAtTime(freq, now);
      // Small detuning for chorus effect
      oscTri.detune.setValueAtTime((idx % 2 === 0 ? 6 : -6), now);

      const oscTriGain = ctx.createGain();
      // Lower notes louder, higher notes softer for balanced mix
      const triVol = 0.12 * (1 - (idx / this.frequencies.length) * 0.4);
      oscTriGain.gain.setValueAtTime(triVol, now);

      oscTri.connect(oscTriGain);
      oscTriGain.connect(this.filter);
      oscTri.start(now);
      this.oscillators.push(oscTri);

      // 2. Rich harmonic wave (Sawtooth, slightly quieter and detuned)
      const oscSaw = ctx.createOscillator();
      oscSaw.type = 'sawtooth';
      oscSaw.frequency.setValueAtTime(freq, now);
      oscSaw.detune.setValueAtTime((idx % 2 === 0 ? -12 : 12), now);

      const oscSawGain = ctx.createGain();
      const sawVol = 0.04 * (1 - (idx / this.frequencies.length) * 0.5);
      oscSawGain.gain.setValueAtTime(sawVol, now);

      oscSaw.connect(oscSawGain);
      oscSawGain.connect(this.filter);
      oscSaw.start(now);
      this.oscillators.push(oscSaw);
    });

    this.isPlaying = true;
    console.log("Ambient Audio Synthesizer started successfully.");
  }

  // Update sound characteristics based on mouse coordinates (-1 to 1)
  updatePitch(x, y) {
    if (!this.isPlaying || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Smoothly transition parameters to prevent clicks
    // Map mouse X (-1 to 1) to LFO frequency (0.05Hz to 0.35Hz)
    const targetLfoFreq = 0.20 + x * 0.15;
    this.lfo.frequency.setTargetAtTime(targetLfoFreq, now, 0.5);

    // Map mouse Y (-1 to 1) to Filter base frequency (300Hz to 850Hz) and LFO depth
    const targetFilterFreq = 575 + y * 275;
    this.filter.frequency.setTargetAtTime(targetFilterFreq, now, 0.3);

    const targetLfoDepth = 250 + y * 100;
    this.lfoGain.gain.setTargetAtTime(targetLfoDepth, now, 0.4);

    // Map Y position to delay feedback amount (higher up = more echoes/spaciousness)
    const targetFeedback = 0.45 + y * 0.15;
    this.feedbackGain.gain.setTargetAtTime(Math.max(0.1, Math.min(0.7, targetFeedback)), now, 0.6);
  }

  stop() {
    if (!this.isPlaying) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Fade out master gain to 0 over 1.5 seconds
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);

    // Stop and clean up nodes after fade out completes
    setTimeout(() => {
      try {
        this.oscillators.forEach(osc => osc.stop());
        this.oscillators = [];
        
        if (this.lfo) {
          this.lfo.stop();
          this.lfo = null;
        }

        this.isPlaying = false;
        console.log("Ambient Audio Synthesizer stopped.");
      } catch (err) {
        console.error("Error cleaning up audio nodes:", err);
      }
    }, 1600);
  }
}

// Export a singleton instance
export const synth = new AmbientSynth();
