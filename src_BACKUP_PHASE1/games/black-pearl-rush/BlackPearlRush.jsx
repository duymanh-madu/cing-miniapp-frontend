import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

export default function BlackPearlRush() {

  const navigate =
    useNavigate();

  const [
    showLeaderboard,
    setShowLeaderboard,
  ] = useState(false);

  const [
  leaderboardData,
  setLeaderboardData
] = useState([]);

  const canvasRef =
    useRef(null);

  const animationRef =
    useRef(null);

  useEffect(() => {

    const canvas =
      canvasRef.current;

    if (!canvas) {

      return;

    }

    const ctx =
      canvas.getContext("2d");

    const DPR =
      window.devicePixelRatio || 1;

    const WIDTH = 420;

    const HEIGHT = 820;

    /**
     * =====================================
     * CANVAS SETUP
     * =====================================
     */

    canvas.width =
      WIDTH * DPR;

    canvas.height =
      HEIGHT * DPR;

    canvas.style.width =
      `${WIDTH}px`;

    canvas.style.height =
      `${HEIGHT}px`;

    ctx.scale(
      DPR,
      DPR
    );

    /**
     * =====================================
     * AUDIO ENGINE VIP PRO
     * =====================================
     */

    const soundFiles = {

      jump:
        "/sounds/jump.mp3",

      score:
        "/sounds/score.mp3",

      die:
        "/sounds/die.mp3",

    };

    const soundCache =
      {};

    Object.entries(
      soundFiles
    ).forEach(
      ([key, src]) => {

        const audio =
          new Audio(src);

        audio.preload =
          "auto";

        audio.volume =
          key === "die"
            ? 0.72
            : 0.42;

        soundCache[key] =
          audio;

      }
    );

    let audioUnlocked =
      false;

    let lastJumpSound =
      0;

    let lastScoreSound =
      0;

    function unlockAudio() {

      if (
        audioUnlocked
      ) {

        return;

      }

      Object.values(
        soundCache
      ).forEach(
        (audio) => {

          audio.play()
            .then(() => {

              audio.pause();

              audio.currentTime = 0;

            })
            .catch(() => {});

        }
      );

      audioUnlocked =
        true;

    }

    function playSound(
      name
    ) {

      const now =
        performance.now();

      /**
       * SAFARI ANTI CUT
       */

      if (
        name === "jump"
      ) {

        if (
          now -
            lastJumpSound <
          60
        ) {

          return;

        }

        lastJumpSound =
          now;

      }

      if (
        name === "score"
      ) {

        if (
          now -
            lastScoreSound <
          45
        ) {

          return;

        }

        lastScoreSound =
          now;

      }

      const base =
        soundCache[name];

      if (!base) {

        return;

      }

      const clone =
        base.cloneNode();

      clone.volume =
        base.volume;

      clone.play()
        .catch(() => {});

    }

    /**
     * =====================================
     * GAME STATE
     * =====================================
     */

    const game = {

      started: false,

      dead: false,

      score: 0,

      combo: 0,

      bestCombo: 0,

      shake: 0,

      flash: 0,

      obstacleTimer: 0,

      particles: [],

      obstacles: [],

      leaderboard: [
  {
    id: 1,
    name: "Player",
    score: 0,
    isPlayer: true,
  },
],

      pearl: {

        x: 120,

        y: HEIGHT / 2,

        radius: 28,

        velocity: 0,

        rotation: 0,

        squash: 1,

      },

    };

    setLeaderboardData(
  [...game.leaderboard]
);

    /**
     * =====================================
     * RESET GAME
     * =====================================
     */

    function resetGame() {

      game.started =
        false;

      game.dead =
        false;

      game.score =
        0;

      game.combo =
        0;

      game.flash =
        0;

      game.shake =
        0;

      game.obstacleTimer =
        0;

      game.obstacles =
        [];

      game.particles =
        [];

      game.pearl.y =
        HEIGHT / 2;

      game.pearl.velocity =
        0;

      game.pearl.rotation =
        0;

      game.pearl.squash =
        1;

    }

    /**
     * =====================================
     * PARTICLES
     * =====================================
     */

    function burst(
      x,
      y,
      count
    ) {

      for (
        let i = 0;
        i < count;
        i++
      ) {

        game.particles.push({

          x,

          y,

          size:
            Math.random() * 5 + 2,

          vx:
            (Math.random() - 0.5) * 8,

          vy:
            (Math.random() - 0.5) * 8,

          alpha: 1,

        });

      }

    }

    /**
     * =====================================
     * JUMP
     * =====================================
     */

    function jump() {

      if (
        game.dead
      ) {

        resetGame();

        return;

      }

      game.started =
        true;

      game.pearl.velocity =
        -8.2;

      game.pearl.squash =
        1.22;

      playSound(
        "jump"
      );

      burst(
        game.pearl.x,
        game.pearl.y,
        10
      );

    }

    /**
     * =====================================
     * CREATE OBSTACLE
     * =====================================
     */

    function createObstacle() {

      const gap =

        game.combo < 10

          ? 250

          : game.combo < 20

          ? 220

          : game.combo < 35

          ? 190

          : 165;

      const center =

        180 +

        Math.random() * 300;

      game.obstacles.push({

        x:
          WIDTH + 100,

        width: 74,

        gapTop:
          center -
          gap / 2,

        gapBottom:
          center +
          gap / 2,

        passed:
          false,

      });

    }

    /**
     * =====================================
     * COLLISION
     * =====================================
     */

    function collide(
      pearl,
      obstacle
    ) {

      const hitX =

        pearl.x +
          pearl.radius >
          obstacle.x &&

        pearl.x -
          pearl.radius <
          obstacle.x +
            obstacle.width;

      if (!hitX) {

        return false;

      }

      const hitTop =

        pearl.y -
          pearl.radius <
        obstacle.gapTop;

      const hitBottom =

        pearl.y +
          pearl.radius >
        obstacle.gapBottom;

      return (
        hitTop ||
        hitBottom
      );

    }

    /**
     * =====================================
     * DIE
     * =====================================
     */

    function die() {

  if (
    game.dead
  ) {

    return;

  }

  game.dead =
    true;

  game.started =
    false;

  game.shake =
    14;

  playSound(
    "die"
  );

  burst(
    game.pearl.x,
    game.pearl.y,
    30
  );

  game.leaderboard[0].score =
    game.bestCombo;

  setLeaderboardData([
    ...game.leaderboard
  ]);

}

    /**
     * =====================================
     * UPDATE
     * =====================================
     */

    function update() {

      if (

        !game.started ||

        game.dead

      ) {

        return;

      }

      const p =
        game.pearl;

      p.velocity +=
        0.42;

      p.y +=
        p.velocity;

      p.rotation =
        p.velocity *
        0.05;

      p.squash +=
        (
          1 -
          p.squash
        ) * 0.12;

      game.obstacleTimer++;

      const spawnDelay =

        game.combo < 10

          ? 95

          : game.combo < 20

          ? 82

          : 74;

      if (

        game.obstacleTimer >
        spawnDelay

      ) {

        createObstacle();

        game.obstacleTimer =
          0;

      }

      const speed =

        game.combo < 10

          ? 3.5

          : game.combo < 20

          ? 4.3

          : game.combo < 35

          ? 5.2

          : 6;

      game.obstacles.forEach(
        (
          obstacle
        ) => {

          obstacle.x -=
            speed;

          if (

            !obstacle.passed &&

            obstacle.x +
              obstacle.width <
              p.x

          ) {

            obstacle.passed =
              true;

            game.score++;

            game.combo++;

            game.bestCombo =
              Math.max(
                game.bestCombo,
                game.combo
              );

            game.flash =
              1;

            playSound(
              "score"
            );

            burst(
              p.x,
              p.y,
              8
            );

          }

          if (

            collide(
              p,
              obstacle
            )

          ) {

            die();

          }

        }
      );

      game.obstacles =
        game.obstacles.filter(
          (
            obstacle
          ) =>
            obstacle.x >
            -140
        );

      if (

        p.y < 0 ||

        p.y > HEIGHT

      ) {

        die();

      }

      game.particles.forEach(
        (
          particle
        ) => {

          particle.x +=
            particle.vx;

          particle.y +=
            particle.vy;

          particle.alpha -=
            0.03;

        }
      );

      game.particles =
        game.particles.filter(
          (
            particle
          ) =>
            particle.alpha > 0
        );

      game.shake *=
        0.9;

      game.flash *=
        0.92;

    }

    /**
     * =====================================
     * DRAW OBSTACLE
     * =====================================
     */

    function drawObstacle(
      obstacle
    ) {

      const gradient =
        ctx.createLinearGradient(

          obstacle.x,

          0,

          obstacle.x +
            obstacle.width,

          0

        );

      gradient.addColorStop(
        0,
        "#ff9d00"
      );

      gradient.addColorStop(
        1,
        "#ff6200"
      );

      ctx.fillStyle =
        gradient;

      ctx.beginPath();

      ctx.roundRect(

        obstacle.x,

        0,

        obstacle.width,

        obstacle.gapTop,

        22

      );

      ctx.fill();

      ctx.beginPath();

      ctx.roundRect(

        obstacle.x,

        obstacle.gapBottom,

        obstacle.width,

        HEIGHT,

        22

      );

      ctx.fill();

    }

    /**
     * =====================================
     * DRAW PEARL
     * =====================================
     */

    function drawPearl() {

      const p =
        game.pearl;

      ctx.save();

      ctx.translate(
        p.x,
        p.y
      );

      ctx.rotate(
        p.rotation
      );

      ctx.scale(
        p.squash,
        1 / p.squash
      );

      const wingFlap =

        Math.sin(
          Date.now() *
            0.02
        ) * 0.12;

      function wing(
        offset,
        flip
      ) {

        ctx.save();

        ctx.translate(
          offset,
          -2
        );

        ctx.scale(
          flip,
          1
        );

        ctx.rotate(
          wingFlap *
            flip
        );

        ctx.fillStyle =
          "rgba(255,255,255,0.95)";

        ctx.beginPath();

        ctx.moveTo(
          0,
          0
        );

        ctx.quadraticCurveTo(
          -30,
          -20,
          -10,
          -58
        );

        ctx.quadraticCurveTo(
          18,
          -32,
          12,
          0
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();

      }

      wing(
        -28,
        1
      );

      wing(
        28,
        -1
      );

      const gradient =
        ctx.createRadialGradient(

          -10,

          -14,

          4,

          0,

          0,

          36

        );

      gradient.addColorStop(
        0,
        "#4b2a19"
      );

      gradient.addColorStop(
        0.4,
        "#1a0f09"
      );

      gradient.addColorStop(
        1,
        "#050505"
      );

      ctx.fillStyle =
        gradient;

      ctx.beginPath();

      ctx.arc(

        0,

        0,

        p.radius,

        0,

        Math.PI * 2

      );

      ctx.fill();

      if (
        game.dead
      ) {

        ctx.fillStyle =
          "white";

        ctx.font =
          "bold 18px Arial";

        ctx.fillText(
          "×",
          -18,
          4
        );

        ctx.fillText(
          "×",
          8,
          4
        );

        ctx.fillStyle =
          "#8ed8ff";

        ctx.fillRect(
          -16,
          10,
          4,
          18
        );

        ctx.fillRect(
          14,
          10,
          4,
          18
        );

      }

      else {

        ctx.fillStyle =
          "white";

        ctx.beginPath();

        ctx.arc(
          -10,
          -2,
          9,
          0,
          Math.PI * 2
        );

        ctx.arc(
          10,
          -2,
          9,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
          "black";

        ctx.beginPath();

        ctx.arc(
          -8,
          0,
          3,
          0,
          Math.PI * 2
        );

        ctx.arc(
          12,
          0,
          3,
          0,
          Math.PI * 2
        );

        ctx.fill();

      }

      ctx.restore();

    }

    /**
     * =====================================
     * DRAW PARTICLES
     * =====================================
     */

    function drawParticles() {

      game.particles.forEach(
        (
          particle
        ) => {

          ctx.globalAlpha =
            particle.alpha;

          ctx.fillStyle =
            "#ffd166";

          ctx.beginPath();

          ctx.arc(

            particle.x,

            particle.y,

            particle.size,

            0,

            Math.PI * 2

          );

          ctx.fill();

          ctx.globalAlpha =
            1;

        }
      );

    }


    /**
     * =====================================
     * DRAW
     * =====================================
     */

    function draw() {

      ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      const bg =
        ctx.createLinearGradient(
          0,
          0,
          0,
          HEIGHT
        );

      bg.addColorStop(
        0,
        "#f7f0e4"
      );

      bg.addColorStop(
        1,
        "#eadcc7"
      );

      ctx.fillStyle =
        bg;

      ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      ctx.save();

      ctx.translate(

        (Math.random() - 0.5) *
          game.shake,

        (Math.random() - 0.5) *
          game.shake

      );

      game.obstacles.forEach(
        drawObstacle
      );

      drawParticles();

      drawPearl();

      ctx.restore();

      /**
       * SCORE
       */

      ctx.fillStyle =
        "#2b160b";

      ctx.font =
        "900 54px Arial";

      ctx.textAlign =
        "center";

      ctx.fillText(
        game.score,
        WIDTH / 2,
        190
      );

      ctx.font =
        "900 24px Arial";

      ctx.fillStyle =
        "#dca63a";

      ctx.fillText(

        `COMBO x${game.combo}`,

        WIDTH / 2,

        145

      );


      /**
       * START
       */

      if (

        !game.started &&

        !game.dead

      ) {

        ctx.fillStyle =
          "#2b160b";

        ctx.font =
          "900 34px Arial";

        ctx.fillText(

          "TAP TO START",

          WIDTH / 2,

          HEIGHT / 2 - 80

        );

      }

      /**
       * GAME OVER
       */

      if (
        game.dead
      ) {

        ctx.fillStyle =
          "rgba(0,0,0,0.55)";

        ctx.fillRect(
          0,
          0,
          WIDTH,
          HEIGHT
        );

        ctx.fillStyle =
          "white";

        ctx.font =
          "900 56px Arial";

        ctx.fillText(

          "THÀNH TÍCH",

          WIDTH / 2,

          HEIGHT / 2 - 40

        );

        ctx.fillStyle =
          "#ffd166";

        ctx.font =
          "900 26px Arial";

        ctx.fillText(

          `BEST COMBO x${game.bestCombo}`,

          WIDTH / 2,

          HEIGHT / 2 + 10

        );

        ctx.fillStyle =
          "white";

        ctx.font =
          "700 20px Arial";

        ctx.fillText(

          "TAP ĐỂ CHƠI LẠI",

          WIDTH / 2,

          HEIGHT / 2 + 70

        );

      }

    }

    /**
     * =====================================
     * LOOP
     * =====================================
     */

    function loop() {

      update();

      draw();

      animationRef.current =
        requestAnimationFrame(
          loop
        );

    }

    loop();

    /**
     * =====================================
     * EVENTS
     * =====================================
     */

    function handleTap(
      event
    ) {

      unlockAudio();

      const rect =
        canvas.getBoundingClientRect();

      const x =
        event.clientX -
        rect.left;

      const y =
        event.clientY -
        rect.top;

      /**
       * LEADERBOARD BUTTON
       */

      if (

        x >= WIDTH - 130 &&
        x <= WIDTH - 38 &&

        y >= 26 &&
        y <= 68

      ) {

        setShowLeaderboard(
  true
);

return;

      }

      jump();

    }

    canvas.addEventListener(
      "pointerdown",
      handleTap
    );

    /**
     * =====================================
     * CLEANUP
     * =====================================
     */

    return () => {

      cancelAnimationFrame(
        animationRef.current
      );

      canvas.removeEventListener(
        "pointerdown",
        handleTap
      );

    };

  }, []);

 return (

  <div
    className="
      min-h-screen
      bg-[#efe7dc]
      flex
      items-center
      justify-center
      p-2
      overflow-hidden
    "
  >

    <div
      className="
        relative
        w-full
        max-w-[420px]
      "
    >

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div
        className="
          absolute
          top-3
          left-3
          right-3
          z-40
          flex
          items-start
          justify-between
          pointer-events-none
        "
      >

        {/* LOGO */}

        <div
          className="
            flex
            items-center
            gap-2
            bg-[#efe7dc]
            border
            border-[#d8c8ae]
            rounded-2xl
            px-3
            py-2
            shadow-lg
            max-w-[250px]
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-xl
              overflow-hidden
              bg-[#efe7dc]
              flex
              items-center
              justify-center
              shrink-0
            "
          >

            <img
              src="/logo-cing.png"
              alt="logo"
              className="
                w-full
                h-full
                object-contain
              "
            />

          </div>

          <div
            className="
              leading-none
              overflow-hidden
            "
          >

            <div
              className="
                text-[10px]
                font-black
                tracking-[2px]
                text-[#c19b61]
                mb-1
              "
            >

              MINI GAME

            </div>

            <div
              className="
                text-[16px]
                font-black
                text-[#2b160b]
                whitespace-nowrap
              "
            >

              Bay cùng trân châu

            </div>

          </div>

        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            flex-col
            gap-2
            pointer-events-auto
          "
        >

          {/* BXH */}

          <button
            onClick={() =>
              setShowLeaderboard(
                true
              )
            }
            className="
              bg-[rgba(0,0,0,0.18)]
              backdrop-blur-md
              text-white
              font-black
              text-sm
              rounded-2xl
              px-4
              h-[42px]
              shadow-lg
            "
          >

            🏆 BXH

          </button>

          {/* GAME CENTER */}

          <button
            onClick={() =>
              navigate(
                "/games"
              )
            }
            className="
              bg-[#2b160b]
              text-white
              font-black
              text-[12px]
              rounded-2xl
              px-4
              h-[42px]
              shadow-lg
            "
          >

            🎮 Game Center

          </button>

        </div>

      </div>

      {/* CANVAS */}

      <canvas
        ref={canvasRef}
        className="
          w-full
          rounded-[32px]
          shadow-2xl
          touch-none
          select-none
        "
      />

      {/* ========================= */}
      {/* LEADERBOARD OVERLAY */}
      {/* ========================= */}

      {
        showLeaderboard && (

          <div
            className="
              absolute
              inset-0
              z-50
              bg-black/70
              backdrop-blur-sm
              flex
              items-center
              justify-center
              rounded-[32px]
              p-4
            "
          >

            <div
              className="
                w-full
                bg-[#f6efe4]
                rounded-[28px]
                p-5
                shadow-2xl
                border
                border-[#dccfb7]
              "
            >

              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-5
                "
              >

                <div
                  className="
                    text-[#2b160b]
                    font-black
                    text-2xl
                  "
                >

                  🏆 TOP 100

                </div>

                <button
                  onClick={() =>
                    setShowLeaderboard(
                      false
                    )
                  }
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-[#2b160b]
                    text-white
                    font-black
                  "
                >

                  ✕

                </button>

              </div>

              {/* LIST */}

              <div
                className="
                  space-y-2
                  max-h-[420px]
                  overflow-y-auto
                  pr-1
                "
              >

                {
  leaderboardData
    ?.slice(0, 20)
    ?.map(
      (
        player,
        index
      ) => (

        <div
          key={
            player.id ||
            index
          }
          className={`
            flex
            items-center
            justify-between
            rounded-2xl
            px-4
            py-3

            ${
              player.isPlayer
                ? "bg-[#2b160b] text-white"
                : "bg-white/70"
            }
          `}
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                font-black
                w-[42px]
                text-[#c19b61]
              "
            >

              #
              {index + 1}

            </div>

            <div
              className="
                font-bold
              "
            >

              {
                player.name
              }

            </div>

          </div>

          <div
            className="
              font-black
            "
          >

            {
              player.score
            }

          </div>

        </div>

      )
    )
}

              </div>

            </div>

          </div>

        )
      }

    </div>

  </div>

);

}