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

class BlockPuzzleAudioRuntime {
  constructor() {
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
        new AudioContextClass();

      const master =
        context.createGain();

      const sfx =
        context.createGain();

      const music =
        context.createGain();

      const compressor =
        context.createDynamicsCompressor();

      master.gain.value =
        SONIC.masterGain;

      sfx.gain.value =
        SONIC.sfxGain;

      music.gain.value =
        SONIC.musicGain;

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
      SONIC.musicGain;

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
    const context =
      this.context;

    if (
      !context ||
      context.state !==
        "running"
    ) {
      return;
    }

    const now =
      context.currentTime;

    /*
     * "Tapioca tok":
     * short warm body + crisp skin.
     */
    this.scheduleTone({
      time:
        now,

      frequency:
        215,

      endFrequency:
        154,

      duration:
        0.085,

      gain:
        0.115,

      type:
        "sine",
    });

    this.scheduleTone({
      time:
        now,

      frequency:
        720,

      endFrequency:
        520,

      duration:
        0.055,

      gain:
        0.045,

      type:
        "triangle",
    });

    this.scheduleNoise({
      time:
        now,

      duration:
        0.038,

      gain:
        0.022,

      highpass:
        950,

      lowpass:
        3100,
    });
  }

  playLineClear(
    lineCount
  ) {
    const context =
      this.context;

    if (
      !context ||
      context.state !==
        "running"
    ) {
      return;
    }

    const count =
      clamp(
        lineCount,
        1,
        4
      );

    const now =
      context.currentTime;

    this.duckMusic(
      0.36,
      0.46
    );

    /*
     * Initial golden impact.
     */
    this.scheduleTone({
      time:
        now,

      frequency:
        118,

      endFrequency:
        78,

      duration:
        0.17,

      gain:
        0.16 +
        count * 0.012,

      type:
        "sine",
    });

    this.scheduleNoise({
      time:
        now + 0.006,

      duration:
        0.09,

      gain:
        0.052 +
        count * 0.008,

      highpass:
        1200,

      lowpass:
        6800,
    });

    /*
     * Sparkle aligns with the visual
     * cell flash / punch.
     */
    const sparkle =
      [
        659.255,
        830.609,
        987.767,
      ];

    sparkle.forEach(
      (
        frequency,
        index
      ) => {
        this.scheduleCingBell(
          now +
            0.035 +
            index * 0.045,

          frequency *
            (
              1 +
              (count - 1) *
              0.035
            ),

          0.055 +
            count * 0.006
        );
      }
    );

    if (
      count >= 2
    ) {
      this.scheduleCingBell(
        now + 0.18,
        1318.510,
        0.055
      );
    }

    if (
      count >= 3
    ) {
      this.scheduleCingBell(
        now + 0.23,
        1661.219,
        0.047
      );
    }
  }

  playCombo(
    combo
  ) {
    const context =
      this.context;

    if (
      !context ||
      context.state !==
        "running"
    ) {
      return;
    }

    const level =
      Math.max(
        1,
        combo
      );

    const index =
      Math.min(
        level - 1,
        SONIC.comboRoots.length - 1
      );

    const root =
      SONIC.comboRoots[index];

    const now =
      context.currentTime +
      0.045;

    const intensity =
      clamp(
        0.072 +
        level * 0.006,
        0.076,
        0.122
      );

    this.duckMusic(
      0.42,
      0.64
    );

    /*
     * Luxury CING motif.
     *
     * Short ascending signature:
     * root → major 3rd → perfect 5th.
     *
     * Register stays warm even at
     * high combos; escalation comes
     * from richness, not shrill pitch.
     */
    const motif =
      [
        root,
        root * 1.25992105,
        root * 1.49830708,
      ];

    motif.forEach(
      (
        frequency,
        noteIndex
      ) => {
        this.scheduleLuxuryMallet(
          now +
          noteIndex * 0.082,

          frequency,

          intensity *
          (
            noteIndex === 2
              ? 1.04
              : 1
          )
        );
      }
    );

    /*
     * Soft caramel/sub impact under
     * the visual badge arrival.
     */
    this.scheduleTone({
      time:
        now + 0.025,

      frequency:
        104,

      endFrequency:
        78,

      duration:
        0.24,

      gain:
        clamp(
          0.092 +
          level * 0.005,
          0.095,
          0.14
        ),

      type:
        "sine",

      attack:
        0.012,
    });

    /*
     * Higher combos become wider and
     * richer, never brighter/shriller.
     */
    if (
      level >= 4
    ) {
      this.scheduleLuxuryMallet(
        now + 0.265,
        root * 0.74915354,
        0.052
      );
    }

    if (
      level >= 8
    ) {
      this.scheduleLuxuryMallet(
        now + 0.315,
        root,
        0.048
      );

      this.scheduleTone({
        time:
          now + 0.19,

        frequency:
          82.407,

        endFrequency:
          65.406,

        duration:
          0.32,

        gain:
          0.075,

        type:
          "sine",

        attack:
          0.016,
      });
    }
  }

  playMoveEvent(
    event
  ) {
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
    if (
      !this.context
    ) {
      return;
    }

    this.musicRequested =
      true;

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
