const CHARACTER_CONTROLLER_VERSION_V1 =
  "cing-artillery-character-controller-v1";

const CHARACTER_STATE_V1 =
  Object.freeze({
    IDLE:
      "idle",

    AIM:
      "aim",

    SHOOT:
      "shoot",

    HIT:
      "hit",

    FALL:
      "fall",

    VICTORY:
      "victory",

    DEFEAT:
      "defeat",
  });

const CHARACTER_STATES_V1 =
  Object.freeze(
    Object.values(
      CHARACTER_STATE_V1
    )
  );

function assertCharacterStateV1(
  state
) {
  if (
    !CHARACTER_STATES_V1.includes(
      state
    )
  ) {
    const error =
      new Error(
        `CHARACTER_PRESENTATION_STATE_INVALID_V1:${String(
          state
        )}`
      );

    error.code =
      "CING_PIU_PIU_CHARACTER_PRESENTATION_STATE_INVALID";

    throw error;
  }

  return state;
}

function createCharacterPresentationControllerV1({
  container,
  activeIndicator,
}) {
  if (
    !container ||
    typeof container.setPosition !==
      "function" ||
    typeof container.setAngle !==
      "function" ||
    typeof container.setAlpha !==
      "function"
  ) {
    throw new Error(
      "CHARACTER_PRESENTATION_CONTAINER_INVALID_V1"
    );
  }

  if (
    !activeIndicator ||
    typeof activeIndicator.setAlpha !==
      "function"
  ) {
    throw new Error(
      "CHARACTER_PRESENTATION_ACTIVE_INDICATOR_INVALID_V1"
    );
  }

  let identity =
    null;

  let state =
    CHARACTER_STATE_V1.IDLE;

  let active =
    false;

  const controller = {
    version:
      CHARACTER_CONTROLLER_VERSION_V1,

    /*
     * Motion presentation authority boundary.
     *
     * BattleScene already moves this exact container from
     * canonical server coordinates. Character rendering may
     * decorate children inside it, but must never own gameplay
     * position, gravity, collision, support or KO.
     */
    container,

    bindIdentity(
      presentation
    ) {
      if (
        !presentation ||
        typeof presentation !==
          "object" ||
        !Object.isFrozen(
          presentation
        )
      ) {
        throw new Error(
          "CHARACTER_PRESENTATION_IDENTITY_INVALID_V1"
        );
      }

      const {
        participant_slot,
        character_key,
        character_name,
        gender,
      } =
        presentation;

      if (
        (
          participant_slot !==
            "player_one" &&
          participant_slot !==
            "player_two"
        ) ||
        typeof character_key !==
          "string" ||
        character_key.length ===
          0 ||
        typeof character_name !==
          "string" ||
        character_name.length ===
          0 ||
        (
          gender !==
            "male" &&
          gender !==
            "female"
        )
      ) {
        throw new Error(
          "CHARACTER_PRESENTATION_IDENTITY_INVALID_V1"
        );
      }

      identity =
        presentation;

      return identity;
    },

    setState(
      nextState
    ) {
      state =
        assertCharacterStateV1(
          nextState
        );

      return state;
    },

    setActive(
      nextActive
    ) {
      active =
        nextActive ===
        true;

      activeIndicator.setAlpha(
        active
          ? 1
          : 0.32
      );

      return active;
    },

    getIdentity() {
      return identity;
    },

    getState() {
      return state;
    },

    isActive() {
      return active;
    },
  };

  return Object.freeze(
    controller
  );
}

export {
  CHARACTER_CONTROLLER_VERSION_V1,
  CHARACTER_STATE_V1,
  CHARACTER_STATES_V1,
  assertCharacterStateV1,
  createCharacterPresentationControllerV1,
};
