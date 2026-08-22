import {
  createBlockPuzzleAudioCuePlan,
} from "./blockPuzzleAudioCuePlan.js";

const SONIC = Object.freeze({
  masterGain:
    0.72,

  sfxGain:
    0.9,

  musicGain:
    0.075,

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
    659.255,
    739.989,
    830.609,
    987.767,
    1108.731,
    1318.510,
  ]),

  musicPlucks: Object.freeze([
    659.255,
    null,
    739.989,
    null,
    830.609,
    null,
    739.989,
    null,
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
        time + 0.008
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
      this.sfx
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
      0.055;

    const intensity =
      clamp(
        0.075 +
        level * 0.009,
        0.08,
        0.16
      );

    this.duckMusic(
      0.24,
      0.72
    );

    /*
     * CING sonic logo:
     *
     *   root
     *      → major third
     *         → perfect fifth
     *
     * Same motif every time,
     * but rising through the Cing
     * pentatonic register.
     */
    const motif =
      [
        root,
        root *
          1.25992105,
        root *
          1.49830708,
      ];

    motif.forEach(
      (
        frequency,
        noteIndex
      ) => {
        this.scheduleCingBell(
          now +
            noteIndex *
              0.073,

          frequency,

          intensity *
            (
              noteIndex === 2
                ? 1.12
                : 1
            )
        );
      }
    );

    /*
     * Warm impact behind the badge
     * arrival (~100ms visual overshoot).
     */
    this.scheduleTone({
      time:
        now + 0.028,

      frequency:
        132,

      endFrequency:
        88,

      duration:
        0.21,

      gain:
        clamp(
          0.12 +
            level * 0.008,
          0.12,
          0.19
        ),

      type:
        "sine",
    });

    if (
      level >= 4
    ) {
      this.scheduleCingBell(
        now + 0.245,
        root * 2,
        0.072
      );
    }

    if (
      level >= 8
    ) {
      this.scheduleNoise({
        time:
          now + 0.19,

        duration:
          0.14,

        gain:
          0.045,

        highpass:
          2800,

        lowpass:
          9800,
      });

      this.scheduleCingBell(
        now + 0.285,
        root * 2.52,
        0.055
      );
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

    const pluck =
      SONIC.musicPlucks[
        step %
        SONIC.musicPlucks.length
      ];

    const bass =
      SONIC.musicBass[
        step %
        SONIC.musicBass.length
      ];

    if (
      Number.isFinite(pluck)
    ) {
      this.scheduleTone({
        time,
        frequency:
          pluck,
        duration:
          0.17,
        gain:
          0.021,
        type:
          "triangle",
        destination:
          this.music,
      });

      this.scheduleTone({
        time:
          time + 0.006,

        frequency:
          pluck * 2,

        duration:
          0.095,
        gain:
          0.006,
        type:
          "sine",
        destination:
          this.music,
      });
    }

    if (
      Number.isFinite(bass)
    ) {
      this.scheduleTone({
        time,
        frequency:
          bass,
        endFrequency:
          bass * 0.985,
        duration:
          0.28,
        gain:
          0.028,
        type:
          "sine",
        destination:
          this.music,
      });
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
        ) % 8;

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

    if (
      this.context.state ===
        "suspended"
    ) {
      this.context
        .resume()
        .catch(() => {});

      return;
    }

    if (
      this.musicTimer !==
        null
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
