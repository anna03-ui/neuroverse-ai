// Procedural Focus Audio Engine powered by Web Audio API
// Custom synthesized ambient tracks matched to each theme vibe with zero external assets required.
import { StudyVibe } from "../types";

export class FocusAudioEngine {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private isActive: boolean = false;
  private activeVibe: StudyVibe | null = null;
  
  // Keep list of active oscillators/filters to dispose when stopped
  private activeSources: { stop: () => void }[] = [];
  private timers: NodeJS.Timeout[] = [];
  private audioTimers: any[] = []; // for interval handles

  constructor() {
    // Lazy initialized when user triggers sound
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.primaryGain.connect(this.ctx.destination);
    }
    // Resume context if suspended
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getActiveVibe(): StudyVibe | null {
    return this.activeVibe;
  }

  public start(vibe: StudyVibe) {
    this.stop();
    this.initCtx();
    if (!this.ctx || !this.primaryGain) return;

    this.isActive = true;
    this.activeVibe = vibe;
    
    // Smooth fade in
    this.primaryGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.primaryGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.primaryGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 1.2);

    try {
      this.synthesizeVibe(vibe);
    } catch (e) {
      console.error("Failed to synthesize ambient focus sound:", e);
    }
  }

  public stop() {
    this.isActive = false;
    this.activeVibe = null;

    // Clear timers
    this.timers.forEach(t => clearInterval(t));
    this.timers = [];
    
    // Stop all active audio nodes safely
    this.activeSources.forEach(src => {
      try {
        src.stop();
      } catch (err) {
        // Source already stopped
      }
    });
    this.activeSources = [];

    // Fade primary level out before pausing if context is active
    if (this.ctx && this.primaryGain) {
      try {
        const curTime = this.ctx.currentTime;
        this.primaryGain.gain.cancelScheduledValues(curTime);
        this.primaryGain.gain.setValueAtTime(this.primaryGain.gain.value, curTime);
        this.primaryGain.gain.linearRampToValueAtTime(0, curTime + 0.3);
      } catch (e) {
        // Gain already disposed
      }
    }
  }

  // Master router for vibe synthesis
  private synthesizeVibe(vibe: StudyVibe) {
    if (!this.ctx || !this.primaryGain) return;

    switch (vibe) {
      case "cozy":
        this.synthesizeCozyLofi();
        break;
      case "scifi":
        this.synthesizeSciFiSpace();
        break;
      case "minimalist":
        this.synthesizeMinimalistZen();
        break;
      case "anime":
        this.synthesizeAnimeDream();
        break;
      case "gamer":
        this.synthesizeGamerArp();
        break;
      case "superhero":
        this.synthesizeSuperheroEpic();
        break;
      default:
        // fallback to cozy
        this.synthesizeMinimalistZen();
        break;
    }
  }

  // --- INDIVIDUAL VIBE GENERATORS ---

  // 1. COZY - Deep rain, crackling fireplace, low warm crackle
  private synthesizeCozyLofi() {
    const ctx = this.ctx!;
    const dest = this.primaryGain!;

    // Rain: Lowpassed white noise
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.setValueAtTime(320, ctx.currentTime);
    rainFilter.Q.setValueAtTime(1, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.3, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(dest);
    
    rainSource.start();
    this.activeSources.push(rainSource);

    // Deep fire rumble hum: 65Hz sine
    const fireOsc = ctx.createOscillator();
    fireOsc.type = "sine";
    fireOsc.frequency.setValueAtTime(65, ctx.currentTime);

    const fireOscGain = ctx.createGain();
    fireOscGain.gain.setValueAtTime(0.08, ctx.currentTime);

    fireOsc.connect(fireOscGain);
    fireOscGain.connect(dest);
    fireOsc.start();
    this.activeSources.push(fireOsc);

    // Fire crackle: Procedurally generated crackles on high frequencies
    const crackleInterval = setInterval(() => {
      if (!this.isActive) return;
      // Random choice with 15% probability
      if (Math.random() < 0.25) {
        const time = ctx.currentTime;
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();

        clickOsc.type = "triangle";
        // high click frequency
        clickOsc.frequency.setValueAtTime(1500 + Math.random() * 3000, time);

        clickGain.gain.setValueAtTime(0, time);
        clickGain.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.02, time + 0.002);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

        clickOsc.connect(clickGain);
        clickGain.connect(dest);
        
        clickOsc.start(time);
        clickOsc.stop(time + 0.05);
      }
    }, 70);

    this.timers.push(crackleInterval);
  }

  // 2. SCIFI - Deep engine drone, pulsing hum, stellar radio beeps
  private synthesizeSciFiSpace() {
    const ctx = this.ctx!;
    const dest = this.primaryGain!;

    // Detuned sawtooth drone for space engine
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(45, ctx.currentTime); // low sub-bass

    osc2.type = "square";
    osc2.frequency.setValueAtTime(90.5, ctx.currentTime); // slightly off-pitch octaved

    osc3.type = "sawtooth";
    osc3.frequency.setValueAtTime(45.62, ctx.currentTime); // detuned

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(110, ctx.currentTime); // deep filter

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.18, ctx.currentTime);

    osc1.connect(lowpass);
    osc2.connect(lowpass);
    osc3.connect(lowpass);
    
    lowpass.connect(droneGain);
    droneGain.connect(dest);

    osc1.start();
    osc2.start();
    osc3.start();

    this.activeSources.push(osc1);
    this.activeSources.push(osc2);
    this.activeSources.push(osc3);

    // SciFi Radar laser ping sequence (pulsar indicator)
    const sciFiPing = () => {
      const t = ctx.currentTime;
      const pulseOsc = ctx.createOscillator();
      const pulseGain = ctx.createGain();
      const delay = ctx.createDelay();
      const feedback = ctx.createGain();

      pulseOsc.type = "sine";
      pulseOsc.frequency.setValueAtTime(880, t);
      // FM sweep representing system diagnosis
      pulseOsc.frequency.exponentialRampToValueAtTime(330, t + 0.6);

      pulseGain.gain.setValueAtTime(0, t);
      pulseGain.gain.linearRampToValueAtTime(0.05, t + 0.01);
      pulseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      delay.delayTime.setValueAtTime(0.18, t);
      feedback.gain.setValueAtTime(0.4, t);

      pulseOsc.connect(pulseGain);
      // feedback delay loop
      pulseGain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      
      pulseGain.connect(dest);
      delay.connect(dest);

      pulseOsc.start(t);
      pulseOsc.stop(t + 0.8);
    };

    // run radar beeps periodically
    sciFiPing();
    const scifiInterval = setInterval(() => {
      if (this.isActive) {
        sciFiPing();
      }
    }, 4500);

    this.timers.push(scifiInterval);
  }

  // 3. MINIMALIST - Medititative wind chimes and singing bowls with organic waves
  private synthesizeMinimalistZen() {
    const ctx = this.ctx!;
    const dest = this.primaryGain!;

    // Absolute low wave: 110Hz / 165Hz pure ambient resonance
    const drone1 = ctx.createOscillator();
    const drone2 = ctx.createOscillator();

    drone1.type = "sine";
    drone1.frequency.setValueAtTime(110, ctx.currentTime); // Deep A2 frequency

    drone2.type = "sine";
    drone2.frequency.setValueAtTime(165, ctx.currentTime); // Perfect fifth E3

    const ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.11, ctx.currentTime);

    drone1.connect(ambientGain);
    drone2.connect(ambientGain);
    ambientGain.connect(dest);

    drone1.start();
    drone2.start();

    this.activeSources.push(drone1);
    this.activeSources.push(drone2);

    // periodic singing bowl trigger function
    const strikeSingingBowl = (freq: number, duration: number, maxVolume: number) => {
      const t = ctx.currentTime;
      // Harmonics of singing bowl
      const oscs = [1, 1.49, 2, 2.76, 3.4].map(ratio => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * ratio, t);
        return osc;
      });

      const bowlGain = ctx.createGain();
      bowlGain.gain.setValueAtTime(0, t);
      bowlGain.gain.linearRampToValueAtTime(maxVolume, t + 0.05); // quick but soft hit
      bowlGain.gain.exponentialRampToValueAtTime(0.0001, t + duration); // long slow ring

      oscs.forEach(osc => {
        osc.connect(bowlGain);
        osc.start(t);
        osc.stop(t + duration);
      });

      bowlGain.connect(dest);
    };

    // strike deep zen bowl atstart
    strikeSingingBowl(180, 8.0, 0.06);
    
    const zenInterval = setInterval(() => {
      if (this.isActive) {
        const notes = [180, 220, 240];
        const selectedNote = notes[Math.floor(Math.random() * notes.length)];
        strikeSingingBowl(selectedNote, 6.0 + Math.random() * 4.0, 0.04 + Math.random() * 0.03);
      }
    }, 6500);

    this.timers.push(zenInterval);
  }

  // 4. ANIME - Dream lofi pads with simple nostalgia notes
  private synthesizeAnimeDream() {
    const ctx = this.ctx!;
    const dest = this.primaryGain!;

    // Warm subharmonic chord helper pad
    const pad1 = ctx.createOscillator();
    const pad2 = ctx.createOscillator();

    pad1.type = "triangle";
    pad1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3

    pad2.type = "sine";
    pad2.frequency.setValueAtTime(195.99, ctx.currentTime); // G3 (perfect fifth)

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, ctx.currentTime);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.18, ctx.currentTime);

    pad1.connect(filter);
    pad2.connect(filter);
    filter.connect(padGain);
    padGain.connect(dest);

    pad1.start();
    pad2.start();

    this.activeSources.push(pad1);
    this.activeSources.push(pad2);

    // Play soft lofi nostalgic bell chimes periodically
    const playLofiArp = () => {
      const time = ctx.currentTime;
      // Dmaj7 to Cmaj7 pentatonic feel
      const notes = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33]; // D4, E4, G4, A4, C5, D5
      const count = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < count; i++) {
        const noteTime = time + i * 0.45;
        const noteFreq = notes[Math.floor(Math.random() * notes.length)];
        
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        const delay = ctx.createDelay();
        const delayGain = ctx.createGain();

        bellOsc.type = "sine";
        bellOsc.frequency.setValueAtTime(noteFreq, noteTime);

        bellGain.gain.setValueAtTime(0, noteTime);
        bellGain.gain.linearRampToValueAtTime(0.04, noteTime + 0.02);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.5);

        // Add soft spatial dimension delay
        delay.delayTime.setValueAtTime(0.25, noteTime);
        delayGain.gain.setValueAtTime(0.3, noteTime);

        bellOsc.connect(bellGain);
        bellGain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(dest);

        bellGain.connect(dest);

        bellOsc.start(noteTime);
        bellOsc.stop(noteTime + 1.8);
      }
    };

    playLofiArp();
    const animeInterval = setInterval(() => {
      if (this.isActive) {
        playLofiArp();
      }
    }, 6000);

    this.timers.push(animeInterval);
  }

  // 5. GAMER - 16-bit retro study sequence arpeggiator
  private synthesizeGamerArp() {
    const ctx = this.ctx!;
    const dest = this.primaryGain!;

    // Chiptune background static noise hum or pulse buzz
    const lowOsc = ctx.createOscillator();
    lowOsc.type = "triangle";
    lowOsc.frequency.setValueAtTime(80, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, ctx.currentTime);

    const lowGain = ctx.createGain();
    lowGain.gain.setValueAtTime(0.12, ctx.currentTime);

    lowOsc.connect(filter);
    filter.connect(lowGain);
    lowGain.connect(dest);

    lowOsc.start();
    this.activeSources.push(lowOsc);

    // Fast pleasant focus chiptune arpeggio
    const scoreNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00]; // C4 to A4
    let scoreIndex = 0;

    const gameInterval = setInterval(() => {
      if (!this.isActive) return;
      
      const t = ctx.currentTime;
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      noteOsc.type = "triangle";
      
      // select current note in pleasant sequential arpeggio
      const freq = scoreNotes[scoreIndex];
      noteOsc.frequency.setValueAtTime(freq, t);

      noteGain.gain.setValueAtTime(0, t);
      noteGain.gain.linearRampToValueAtTime(0.03, t + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      noteOsc.connect(noteGain);
      noteGain.connect(dest);

      noteOsc.start(t);
      noteOsc.stop(t + 0.22);

      scoreIndex = (scoreIndex + 1) % scoreNotes.length;
    }, 380);

    this.timers.push(gameInterval);
  }

  // 6. SUPERHERO - Epic deep string drone with heavy synthetic heartbeat pulse
  private synthesizeSuperheroEpic() {
    const ctx = this.ctx!;
    const dest = this.primaryGain!;

    // Epic heavy brass-like focal synthetic pad
    const stringSub1 = ctx.createOscillator();
    const stringSub2 = ctx.createOscillator();

    stringSub1.type = "sawtooth";
    stringSub1.frequency.setValueAtTime(73.42, ctx.currentTime); // D2

    stringSub2.type = "triangle";
    stringSub2.frequency.setValueAtTime(110.0, ctx.currentTime); // A2 (fifth-ish feel for resolution)

    const stringFilter = ctx.createBiquadFilter();
    stringFilter.type = "lowpass";
    stringFilter.frequency.setValueAtTime(120, ctx.currentTime);

    const stringGain = ctx.createGain();
    stringGain.gain.setValueAtTime(0.16, ctx.currentTime);

    stringSub1.connect(stringFilter);
    stringSub2.connect(stringFilter);
    stringFilter.connect(stringGain);
    stringGain.connect(dest);

    stringSub1.start();
    stringSub2.start();

    this.activeSources.push(stringSub1);
    this.activeSources.push(stringSub2);

    // Heartbeat focused rhythm trigger
    const playHeartbeat = () => {
      const time = ctx.currentTime;
      // Duble-beat mimic ("lub-dub")
      const beats = [0.0, 0.22];
      
      beats.forEach(delay => {
        const beatOsc = ctx.createOscillator();
        const beatGain = ctx.createGain();

        beatOsc.type = "sine";
        // low organic thud
        beatOsc.frequency.setValueAtTime(65, time + delay);
        beatOsc.frequency.exponentialRampToValueAtTime(25, time + delay + 0.18);

        beatGain.gain.setValueAtTime(0, time + delay);
        beatGain.gain.linearRampToValueAtTime(0.18, time + delay + 0.01);
        beatGain.gain.exponentialRampToValueAtTime(0.0001, time + delay + 0.2);

        beatOsc.connect(beatGain);
        beatGain.connect(dest);

        beatOsc.start(time + delay);
        beatOsc.stop(time + delay + 0.25);
      });
    };

    // Trigger heartbeat once every 1200ms
    playHeartbeat();
    const heroInterval = setInterval(() => {
      if (this.isActive) {
        playHeartbeat();
      }
    }, 1400);

    this.timers.push(heroInterval);
  }
}

// Global Singleton for easy cross-component synchronization if needed
export const focusAudioInstance = new FocusAudioEngine();
