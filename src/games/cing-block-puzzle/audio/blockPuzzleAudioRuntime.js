import {
  createBlockPuzzleAudioCuePlan,
} from "./blockPuzzleAudioCuePlan.js";

const SONIC = Object.freeze({
  masterGain:
    0.72,

  sfxGain:
    0.9,

  musicGain:
    0.26,

  bpm:
    96,

  schedulerLookAheadSeconds:
    0.18,

  schedulerIntervalMs:
    75,

  /*
   * E-major pentatonic family.
   * This pitch family becomes the
   * recognizable Cing Block Puzzle DNA.
   */
  comboRoots: Object.freeze([
    329.628,
    369.994,
    415.305,
    440.000,
    493.883,
    554.365,
  ]),

  musicPlucks: Object.freeze([
    659.255,
    null,
    739.989,
    null,
    830.609,
    739.989,
    null,
    659.255,
    554.365,
    null,
    659.255,
    null,
    739.989,
    659.255,
    null,
    554.365,
  ]),

  musicBass: Object.freeze([
    164.814,
    null,
    null,
    null,
    123.471,
    null,
    null,
    null,
    138.591,
    null,
    null,
    null,
    110.000,
    null,
    null,
    null,
  ]),
});

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

export class BlockPuzzleAudioRuntime {
  constructor() {
    this.preferences = { sound: true, music: true, volume: 0.7 };
    this.context =
      null;

    this.master =
      null;

    this.sfx =
      null;

    this.music =
      null;

    this.compressor =
      null;

    this.noiseBuffer =
      null;

    this.musicTimer =
      null;

    this.musicRequested =
      false;

    this.musicStep =
      0;

    this.nextMusicTime =
      0;
  }

  setPreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
    const now = this.context?.currentTime;
    if (this.master && Number.isFinite(now)) {
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(SONIC.masterGain * this.preferences.volume, now, 0.018);
      this.sfx.gain.cancelScheduledValues(now);
      this.sfx.gain.setTargetAtTime(this.preferences.sound ? SONIC.sfxGain : 0, now, 0.012);
    }
    if (!this.preferences.music) this.stopMusic();
  }

  /*
   * IMPORTANT:
   * Must be called synchronously inside
   * a real user gesture for Zalo WebView.
   */
  unlockFromGesture() {
    if (
      typeof window ===
        "undefined"
    ) {
      return false;
    }

    if (this.context) {
      if (
        this.context.state ===
          "suspended"
      ) {
        this.context
          .resume()
          .catch(() => {});
      }

      return true;
    }

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return false;
    }

    try {
      const context =
        new AudioContextClass({ latencyHint: "interactive" });

      const master =
        context.createGain();

      const sfx =
        context.createGain();

      const music =
        context.createGain();

      const compressor =
        context.createDynamicsCompressor();

      master.gain.value =
        SONIC.masterGain * this.preferences.volume;

      sfx.gain.value =
        this.preferences.sound ? SONIC.sfxGain : 0;

      music.gain.value =
        this.preferences.music ? SONIC.musicGain : 0;

      compressor.threshold.value =
        -15;

      compressor.knee.value =
        16;

      compressor.ratio.value =
        4;

      compressor.attack.value =
        0.004;

      compressor.release.value =
        0.14;

      sfx.connect(
        master
      );

      music.connect(
        master
      );

      master.connect(
        compressor
      );

      compressor.connect(
        context.destination
      );

      this.context =
        context;

      this.master =
        master;

      this.sfx =
        sfx;

      this.music =
        music;

      this.compressor =
        compressor;

      this.noiseBuffer =
        this.createCingNoiseBuffer();

      if (
        context.state ===
          "suspended"
      ) {
        context
          .resume()
          .catch(() => {});
      }

      return true;
    } catch {
      return false;
    }
  }

  /*
   * Deterministic pseudo-noise seeded by
   * ASCII "CING" (0x43 49 4E 47).
   *
   * It gives the synthesized transient
   * a stable timbral fingerprint instead
   * of random noise on every app load.
   */
  createCingNoiseBuffer() {
    const context =
      this.context;

    if (!context) {
      return null;
    }

    const durationSeconds =
      0.35;

    const length =
      Math.ceil(
        context.sampleRate *
        durationSeconds
      );

    const buffer =
      context.createBuffer(
        1,
        length,
        context.sampleRate
      );

    const channel =
      buffer.getChannelData(0);

    let seed =
      0x43494e47;

    for (
      let index = 0;
      index < length;
      index += 1
    ) {
      seed =
        (
          Math.imul(
            seed,
            1664525
          ) +
          1013904223
        ) >>> 0;

      channel[index] =
        (
          seed /
          0xffffffff
        ) * 2 - 1;
    }

    return buffer;
  }

  scheduleTone({
    time,
    frequency,
    endFrequency =
      null,
    duration,
    gain,
    type =
      "sine",
    attack =
      0.008,
    destination =
      this.sfx,
  }) {
    const context =
      this.context;

    if (
      !context ||
      !destination
    ) {
      return;
    }

    const oscillator =
      context.createOscillator();

    const envelope =
      context.createGain();

    oscillator.type =
      type;

    oscillator.frequency
      .setValueAtTime(
        frequency,
        time
      );

    if (
      Number.isFinite(
        endFrequency
      ) &&
      endFrequency > 0
    ) {
      oscillator.frequency
        .exponentialRampToValueAtTime(
          endFrequency,
          time + duration
        );
    }

    envelope.gain
      .setValueAtTime(
        0.0001,
        time
      );

    envelope.gain
      .exponentialRampToValueAtTime(
        gain,
        time + attack
      );

    envelope.gain
      .exponentialRampToValueAtTime(
        0.0001,
        time + duration
      );

    oscillator.connect(
      envelope
    );

    envelope.connect(
      destination
    );

    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
    oscillator.start(
      time
    );

    oscillator.stop(
      time +
      duration +
      0.02
    );
  }

  scheduleNoise({
    time,
    duration,
    gain,
    highpass,
    lowpass,
    destination =
      this.sfx,
  }) {
    const context =
      this.context;

    if (
      !context ||
      !this.noiseBuffer ||
      !this.sfx
    ) {
      return;
    }

    const source =
      context.createBufferSource();

    const hp =
      context.createBiquadFilter();

    const lp =
      context.createBiquadFilter();

    const envelope =
      context.createGain();

    source.buffer =
      this.noiseBuffer;

    hp.type =
      "highpass";

    hp.frequency.value =
      highpass;

    lp.type =
      "lowpass";

    lp.frequency.value =
      lowpass;

    envelope.gain
      .setValueAtTime(
        gain,
        time
      );

    envelope.gain
      .exponentialRampToValueAtTime(
        0.0001,
        time + duration
      );

    source.connect(
      hp
    );

    hp.connect(
      lp
    );

    lp.connect(
      envelope
    );

    envelope.connect(
      destination
    );

    source.onended = () => {
      source.disconnect(); hp.disconnect(); lp.disconnect(); envelope.disconnect();
    };
    source.start(
      time,
      0,
      duration
    );
  }

  scheduleCingBell(
    time,
    frequency,
    gain
  ) {
    /*
     * Main ceramic/glass tone.
     */
    this.scheduleTone({
      time,
      frequency,
      duration:
        0.34,
      gain,
      type:
        "sine",
    });

    /*
     * Bright metallic upper partial.
     */
    this.scheduleTone({
      time:
        time + 0.004,

      frequency:
        frequency * 2.01,

      endFrequency:
        frequency * 1.995,

      duration:
        0.19,

      gain:
        gain * 0.28,

      type:
        "triangle",
    });

    /*
     * Small Cing sparkle.
     */
    this.scheduleTone({
      time:
        time + 0.012,

      frequency:
        frequency * 3.02,

      duration:
        0.11,

      gain:
        gain * 0.11,

      type:
        "sine",
    });
  }

  scheduleLuxuryMallet(
    time,
    frequency,
    gain
  ) {
    /*
     * Cing Velvet Chime:
     * warm fundamental + muted wooden
     * upper body. No brittle 3x sparkle.
     */
    this.scheduleTone({
      time,
      frequency,

      duration:
        0.42,

      gain,

      type:
        "sine",

      attack:
        0.014,
    });

    this.scheduleTone({
      time:
        time + 0.008,

      frequency:
        frequency * 1.49830708,

      duration:
        0.29,

      gain:
        gain * 0.24,

      type:
        "triangle",

      attack:
        0.018,
    });

    this.scheduleTone({
      time:
        time + 0.015,

      frequency:
        frequency * 0.5,

      duration:
        0.31,

      gain:
        gain * 0.19,

      type:
        "sine",

      attack:
        0.012,
    });
  }

  duckMusic(
    depth,
    duration
  ) {
    const context =
      this.context;

    if (
      !context ||
      !this.music
    ) {
      return;
    }

    const now =
      context.currentTime;

    const normal =
      this.preferences.music && this.musicRequested ? SONIC.musicGain : 0;

    const ducked =
      normal *
      clamp(
        depth,
        0.15,
        0.75
      );

    this.music.gain
      .cancelScheduledValues(
        now
      );

    this.music.gain
      .setValueAtTime(
        this.music.gain.value,
        now
      );

    this.music.gain
      .linearRampToValueAtTime(
        ducked,
        now + 0.035
      );

    this.music.gain
      .linearRampToValueAtTime(
        normal,
        now + duration
      );
  }

  playPlacement() {
    if (!this.context || this.context.state !== 'running') return;
    const now=this.context.currentTime;
    this.placementVoice=(this.placementVoice || 0)+1;
    const pitch=[1,1.035,.98,1.018][this.placementVoice%4];
    // Firm body, elastic pop and a very short contact tick: audible on a phone speaker.
    this.scheduleTone({time:now,frequency:440*pitch,endFrequency:185*pitch,duration:.065,gain:.21,type:'sine',attack:.002});
    this.scheduleTone({time:now+.003,frequency:960*pitch,endFrequency:610*pitch,duration:.033,gain:.055,type:'triangle',attack:.001});
    this.scheduleNoise({time:now,duration:.018,gain:.035,highpass:1600,lowpass:5400});
  }

  playLineClear(lineCount) {
    if (!this.context || this.context.state !== 'running') return;
    const now=this.context.currentTime, tier=clamp(lineCount,1,4);
    const phrases=[null,[783.991,1174.659,1567.982],[659.255,830.609,987.767,1318.510],
      [523.251,659.255,783.991,1046.502,1318.510],[523.251,783.991,1046.502,1318.510,1567.982,2093.005]];
    this.duckMusic(.24,.32+tier*.09);
    this.scheduleTone({time:now,frequency:190+tier*24,endFrequency:85,duration:.1+tier*.015,gain:.17,type:'sine',attack:.002});
    // A brief, soft fracture, followed by a different consonant phrase at each clear level.
    this.scheduleNoise({time:now+.004,duration:.045+tier*.008,gain:.045,highpass:1400,lowpass:6200});
    phrases[tier].forEach((frequency,index)=>this.scheduleCingBell(now+.018+index*(tier===1?.026:.038),frequency,.065-index*.005));
    if(tier>=2) this.scheduleTone({time:now+.055,frequency:phrases[tier][0]/2,duration:.22,gain:.06,type:'triangle',attack:.005});
    if(tier>=3) [1,1.25,1.5].forEach(ratio=>this.scheduleTone({time:now+.12,frequency:523.251*ratio,duration:.26,gain:.025,type:'sine',attack:.015}));
  }

  playCombo(combo) {
    if (!this.context || this.context.state !== 'running') return;
    const now=this.context.currentTime, level=clamp(combo,1,8);
    // A tiny ascending answer to the clear phrase, rather than another long overlapping melody.
    const root=[987.767,1108.731,1174.659,1318.510][(level-1)%4];
    this.scheduleTone({time:now+.17,frequency:root,duration:.13,gain:.042,type:'sine',attack:.003});
    this.scheduleTone({time:now+.215,frequency:root*1.5,duration:.16,gain:.034,type:'sine',attack:.003});
  }

  playClearFinish(event) {
    if (!this.context || this.context.state !== 'running') return;
    const now=this.context.currentTime;
    // A short rising glass sweep follows the light core; tiny chips resolve behind it.
    const tier=clamp(event.lineCount,1,4);
    this.scheduleTone({time:now+.012,frequency:420+tier*100,endFrequency:1100+tier*250,duration:.075+tier*.02,gain:.026,type:'sine',attack:.003});
    for(let i=0;i<tier+1;i++) this.scheduleNoise({time:now+.055+i*.035,duration:.025,gain:.018*(1-i*.15),highpass:2200+i*450,lowpass:8000});
    if (event.perfectClear) {
      this.duckMusic(.22,.9);
      [523.251,659.255,783.991,1046.502].forEach((frequency,index)=>{
        this.scheduleTone({time:now+.16+index*.045,frequency,duration:.48,gain:.045,type:'triangle',attack:.008});
      });
    }
  }

  playMoveEvent(
    event
  ) {
    if (!this.preferences.sound || this.preferences.volume === 0) return;
    const cues =
      createBlockPuzzleAudioCuePlan(
        event
      );

    for (
      const cue of cues
    ) {
      if (
        cue.type ===
          "placement"
      ) {
        this.playPlacement();
      } else if (
        cue.type ===
          "line_clear"
      ) {
        this.playLineClear(
          cue.lineCount
        );
        this.playClearFinish(event);
      } else if (
        cue.type ===
          "combo"
      ) {
        this.playCombo(
          cue.combo
        );
      }
    }
  }

  scheduleMusicStep(
    time,
    step
  ) {
    if (
      !this.context ||
      !this.music
    ) {
      return;
    }

    const phraseLength =
      SONIC.musicPlucks.length;

    const phraseStep =
      step %
      phraseLength;

    const pluck =
      SONIC.musicPlucks[
        phraseStep
      ];

    const bass =
      SONIC.musicBass[
        phraseStep
      ];

    /*
     * Cing Lounge Rhodes:
     * soft fundamental + restrained fifth.
     * Warm and musical, never metallic.
     */
    if (
      Number.isFinite(pluck)
    ) {
      this.scheduleTone({
        time,

        frequency:
          pluck,

        duration:
          0.34,

        gain:
          0.052,

        type:
          "sine",

        attack:
          0.022,

        destination:
          this.music,
      });

      this.scheduleTone({
        time:
          time + 0.012,

        frequency:
          pluck * 1.49830708,

        duration:
          0.21,

        gain:
          0.013,

        type:
          "triangle",

        attack:
          0.03,

        destination:
          this.music,
      });
    }

    /*
     * Round lounge bass.
     */
    if (
      Number.isFinite(bass)
    ) {
      this.scheduleTone({
        time,

        frequency:
          bass,

        endFrequency:
          bass * 0.992,

        duration:
          0.5,

        gain:
          0.078,

        type:
          "sine",

        attack:
          0.032,

        destination:
          this.music,
      });
    }

    /*
     * Cing bubble pulse.
     * A soft upward droplet on offbeats
     * gives the loop its own brand texture.
     */
    if (
      phraseStep %
        2 === 1
    ) {
      const bubbleBase =
        phraseStep >= 8
          ? 246.942
          : 220.000;

      this.scheduleTone({
        time:
          time + 0.018,

        frequency:
          bubbleBase,

        endFrequency:
          bubbleBase * 1.18,

        duration:
          0.095,

        gain:
          0.025,

        type:
          "sine",

        attack:
          0.012,

        destination:
          this.music,
      });
    }

    /*
     * Velvet chord at the start of each
     * half phrase. This makes the background
     * feel composed rather than sequenced.
     */
    if (
      phraseStep === 0 ||
      phraseStep === 8
    ) {
      const chord =
        phraseStep === 0
          ? [
              329.628,
              415.305,
              493.883,
            ]
          : [
              277.183,
              369.994,
              440.000,
            ];

      chord.forEach(
        (
          frequency,
          index
        ) => {
          this.scheduleTone({
            time:
              time +
              index * 0.012,

            frequency,

            duration:
              0.78,

            gain:
              0.023,

            type:
              "sine",

            attack:
              0.085,

            destination:
              this.music,
          });
        }
      );
    }
  }

  runMusicScheduler() {
    const context =
      this.context;

    if (
      !context ||
      context.state !==
        "running" ||
      !this.musicRequested
    ) {
      return;
    }

    const secondsPerBeat =
      60 /
      SONIC.bpm;

    const stepDuration =
      secondsPerBeat / 2;

    if (this.nextMusicTime < context.currentTime - 0.1) {
      this.nextMusicTime = context.currentTime + 0.025;
    }
    const horizon =
      context.currentTime +
      SONIC.schedulerLookAheadSeconds;

    while (
      this.nextMusicTime <
      horizon
    ) {
      this.scheduleMusicStep(
        this.nextMusicTime,
        this.musicStep
      );

      this.musicStep =
        (
          this.musicStep + 1
        ) %
        SONIC.musicPlucks.length;

      this.nextMusicTime +=
        stepDuration;
    }
  }

  startMusic() {
    if (!this.preferences.music) return;
    if (
      !this.context
    ) {
      return;
    }

    this.musicRequested =
      true;
    this.music.gain.cancelScheduledValues(this.context.currentTime);
    this.music.gain.setTargetAtTime(SONIC.musicGain, this.context.currentTime, 0.04);

    const beginScheduler =
      () => {
        if (
          !this.musicRequested ||
          this.musicTimer !==
            null ||
          !this.context ||
          this.context.state !==
            "running"
        ) {
          return;
        }

        this.musicStep =
          0;

        this.nextMusicTime =
          this.context.currentTime +
          0.04;

        this.runMusicScheduler();

        this.musicTimer =
          window.setInterval(
            () => {
              this.runMusicScheduler();
            },
            SONIC.schedulerIntervalMs
          );
      };

    if (
      this.context.state ===
        "suspended"
    ) {
      this.context
        .resume()
        .then(
          beginScheduler
        )
        .catch(() => {});

      return;
    }

    beginScheduler();
  }

  stopMusic() {
    if (this.music && this.context) {
      this.music.gain.cancelScheduledValues(this.context.currentTime);
      this.music.gain.setTargetAtTime(0, this.context.currentTime, 0.025);
    }
    this.musicRequested =
      false;

    if (
      this.musicTimer !==
        null
    ) {
      window.clearInterval(
        this.musicTimer
      );

      this.musicTimer =
        null;
    }
  }

  suspend() {
    if (
      this.musicTimer !==
        null
    ) {
      window.clearInterval(
        this.musicTimer
      );

      this.musicTimer =
        null;
    }

    if (
      this.context?.state ===
        "running"
    ) {
      this.context
        .suspend()
        .catch(() => {});
    }
  }

  resume() {
    const context =
      this.context;

    if (!context) {
      return;
    }

    const restartMusic =
      () => {
        if (
          this.musicRequested &&
          this.musicTimer ===
            null
        ) {
          this.musicStep =
            0;

          this.nextMusicTime =
            context.currentTime +
            0.04;

          this.runMusicScheduler();

          this.musicTimer =
            window.setInterval(
              () => {
                this.runMusicScheduler();
              },
              SONIC.schedulerIntervalMs
            );
        }
      };

    if (
      context.state ===
        "suspended"
    ) {
      context
        .resume()
        .then(
          restartMusic
        )
        .catch(() => {});
    } else {
      restartMusic();
    }
  }
}

const blockPuzzleAudioRuntime =
  new BlockPuzzleAudioRuntime();

export default
blockPuzzleAudioRuntime;
