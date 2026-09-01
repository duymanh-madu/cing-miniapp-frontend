const FIRING_PRESENTATION_VERSION_V1 =
  "cing-artillery-firing-presentation-v1";

const FIRING_FEEL_V1 =
  Object.freeze({
    chargeStartPower: 18,
    chargeRatePerSecond: 58,
    chargeTickMs: 16,
    muzzleFlashDurationMs: 110,
    muzzleRingDurationMs: 170,
    recoilShakeDurationMs: 90,
    recoilShakeIntensity: 0.0038,
  });

function clampPowerV1(
  value
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    throw new Error(
      "CING_PIU_PIU_FIRING_POWER_INVALID"
    );
  }

  return Math.max(
    0,
    Math.min(
      100,
      value
    )
  );
}

function resolveViewerPlayerV1(
  snapshot
) {
  const viewerAccountId =
    snapshot
      ?.viewer
      ?.account_id;

  const playerOne =
    snapshot
      ?.players
      ?.player_one;

  const playerTwo =
    snapshot
      ?.players
      ?.player_two;

  if (
    playerOne?.account_id ===
    viewerAccountId
  ) {
    return {
      slot: 1,
      player:
        playerOne,
      facing:
        1,
    };
  }

  if (
    playerTwo?.account_id ===
    viewerAccountId
  ) {
    return {
      slot: 2,
      player:
        playerTwo,
      facing:
        -1,
    };
  }

  return null;
}

function createFiringPresentationV1({
  scene,
  world,
  snapshot,
  getAimAngleDeg,
  getPower,
  setPower,
  isViewerTurn,
  getCharacterController,
}) {
  if (
    !scene ||
    !world ||
    typeof getAimAngleDeg !==
      "function" ||
    typeof getPower !==
      "function" ||
    typeof setPower !==
      "function" ||
    typeof isViewerTurn !==
      "function" ||
    typeof getCharacterController !==
      "function"
  ) {
    throw new Error(
      "CING_PIU_PIU_FIRING_PRESENTATION_CONFIG_INVALID"
    );
  }

  let currentSnapshot =
    snapshot;

  let charging =
    false;

  let chargeStartedAt =
    null;

  let chargeStartPower =
    null;

  let chargeTimer =
    null;

  let muzzleObjects =
    [];

  function clearChargeTimer() {
    if (
      chargeTimer !==
      null
    ) {
      scene.time.removeEvent(
        chargeTimer
      );

      chargeTimer =
        null;
    }
  }

  function setSnapshot(
    nextSnapshot
  ) {
    currentSnapshot =
      nextSnapshot;
  }

  function beginCharge() {
    if (
      charging ||
      !isViewerTurn()
    ) {
      return false;
    }

    charging =
      true;

    chargeStartedAt =
      scene.time.now;

    chargeStartPower =
      Math.max(
        FIRING_FEEL_V1
          .chargeStartPower,
        clampPowerV1(
          getPower()
        )
      );

    setPower(
      chargeStartPower
    );

    const controller =
      getCharacterController();

    controller
      ?.setState?.(
        "aim"
      );

    clearChargeTimer();

    chargeTimer =
      scene.time.addEvent({
        delay:
          FIRING_FEEL_V1
            .chargeTickMs,

        loop:
          true,

        callback:
          () => {
            if (
              !charging ||
              !isViewerTurn()
            ) {
              return;
            }

            const elapsedSeconds =
              Math.max(
                0,
                (
                  scene.time.now -
                  chargeStartedAt
                ) /
                1000
              );

            const nextPower =
              clampPowerV1(
                chargeStartPower +
                elapsedSeconds *
                  FIRING_FEEL_V1
                    .chargeRatePerSecond
              );

            setPower(
              nextPower
            );

            if (
              nextPower >=
              100
            ) {
              clearChargeTimer();
            }
          },
      });

    return true;
  }

  function cancelCharge() {
    if (
      !charging
    ) {
      return;
    }

    charging =
      false;

    chargeStartedAt =
      null;

    chargeStartPower =
      null;

    clearChargeTimer();

    const controller =
      getCharacterController();

    controller
      ?.setState?.(
        "idle"
      );
  }

  function releaseCharge() {
    if (
      !charging
    ) {
      return false;
    }

    charging =
      false;

    chargeStartedAt =
      null;

    chargeStartPower =
      null;

    clearChargeTimer();

    return true;
  }

  function destroyMuzzleObjects() {
    for (
      const object of
      muzzleObjects
    ) {
      object
        ?.destroy?.();
    }

    muzzleObjects =
      [];
  }

  function presentAcceptedFire({
    angleDeg,
    power,
  }) {
    if (
      !Number.isFinite(
        angleDeg
      ) ||
      !Number.isFinite(
        power
      )
    ) {
      throw new Error(
        "CING_PIU_PIU_ACCEPTED_FIRE_PRESENTATION_INVALID"
      );
    }

    const viewer =
      resolveViewerPlayerV1(
        currentSnapshot
      );

    if (!viewer) {
      return;
    }

    const x =
      Number(
        viewer
          .player
          ?.position_x
      );

    const y =
      Number(
        viewer
          .player
          ?.position_y
      );

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {
      return;
    }

    const controller =
      getCharacterController();

    controller
      ?.setState?.(
        "shoot"
      );

    destroyMuzzleObjects();

    const radians =
      scene
        .math
        ?.degToRad
        ? scene.math.degToRad(
            angleDeg
          )
        : angleDeg *
          Math.PI /
          180;

    const muzzleDistance =
      34;

    const muzzleX =
      x +
      Math.cos(
        radians
      ) *
      muzzleDistance *
      viewer.facing;

    const muzzleY =
      y -
      28 -
      Math.sin(
        radians
      ) *
      muzzleDistance;

    const flash =
      scene.add.circle(
        muzzleX,
        muzzleY,
        7,
        0xffe3a1,
        0.96
      )
        .setDepth(
          930
        );

    const ring =
      scene.add.circle(
        muzzleX,
        muzzleY,
        5,
        0xffa33c,
        0
      )
        .setStrokeStyle(
          3,
          0xffb347,
          0.92
        )
        .setDepth(
          929
        );

    world.add([
      ring,
      flash,
    ]);

    muzzleObjects = [
      flash,
      ring,
    ];

    scene.tweens.add({
      targets:
        flash,
      scale:
        2.15,
      alpha:
        0,
      duration:
        FIRING_FEEL_V1
          .muzzleFlashDurationMs,
      ease:
        "Quad.easeOut",
      onComplete:
        () => {
          flash.destroy();

          muzzleObjects =
            muzzleObjects.filter(
              object =>
                object !==
                flash
            );
        },
    });

    scene.tweens.add({
      targets:
        ring,
      scale:
        3.1,
      alpha:
        0,
      duration:
        FIRING_FEEL_V1
          .muzzleRingDurationMs,
      ease:
        "Cubic.easeOut",
      onComplete:
        () => {
          ring.destroy();

          muzzleObjects =
            muzzleObjects.filter(
              object =>
                object !==
                ring
            );
        },
    });

    /*
     * Recoil feedback is camera-only. Never tween or
     * offset the authoritative player motion container.
     */
    scene.cameras.main
      ?.shake(
        FIRING_FEEL_V1
          .recoilShakeDurationMs,
        FIRING_FEEL_V1
          .recoilShakeIntensity
      );

    scene.time.delayedCall(
      180,
      () => {
        if (
          isViewerTurn()
        ) {
          controller
            ?.setState?.(
              "aim"
            );
        } else {
          controller
            ?.setState?.(
              "idle"
            );
        }
      }
    );
  }

  function destroy() {
    charging =
      false;

    clearChargeTimer();

    destroyMuzzleObjects();
  }

  return Object.freeze({
    version:
      FIRING_PRESENTATION_VERSION_V1,

    beginCharge,
    cancelCharge,
    releaseCharge,
    presentAcceptedFire,
    setSnapshot,
    destroy,

    isCharging:
      () =>
        charging,
  });
}

export {
  FIRING_FEEL_V1,
  FIRING_PRESENTATION_VERSION_V1,
  clampPowerV1,
  createFiringPresentationV1,
  resolveViewerPlayerV1,
};
