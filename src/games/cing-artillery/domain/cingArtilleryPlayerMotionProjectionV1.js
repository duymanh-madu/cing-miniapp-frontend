const MOTION_STATE =
  Object.freeze({
    STABLE:
      "stable",
    FALLING:
      "falling",
  });

function fail(
  field
) {
  const error =
    new Error(
      `PLAYER_MOTION_INVALID_V1:${field}`
    );

  error.code =
    "CING_PIU_PIU_PLAYER_MOTION_INVALID";

  throw error;
}

function requireInteger(
  value,
  field
) {
  let numeric;

  if (
    typeof value ===
      "number"
  ) {
    numeric =
      value;
  } else if (
    typeof value ===
      "string" &&
    /^-?(0|[1-9][0-9]*)$/u.test(
      value
    )
  ) {
    numeric =
      Number(
        value
      );
  } else {
    fail(
      field
    );
  }

  if (
    !Number.isSafeInteger(
      numeric
    )
  ) {
    fail(
      field
    );
  }

  return numeric;
}

function requireIdentity(
  value,
  field
) {
  const normalized =
    String(
      value || ""
    ).trim();

  if (!normalized) {
    fail(
      field
    );
  }

  return normalized;
}

export function
projectPlayerMotionV1(
  input
) {
  if (
    !input ||
    typeof input !==
      "object"
  ) {
    fail(
      "input"
    );
  }

  const motionState =
    String(
      input.motion_state || ""
    ).trim();

  if (
    motionState !==
      MOTION_STATE.STABLE &&
    motionState !==
      MOTION_STATE.FALLING
  ) {
    fail(
      "motion_state"
    );
  }

  return Object.freeze({
    account_id:
      requireIdentity(
        input.account_id,
        "account_id"
      ),

    gameplay_session_id:
      requireIdentity(
        input.gameplay_session_id,
        "gameplay_session_id"
      ),

    position_x:
      requireInteger(
        input.position_x,
        "position_x"
      ),

    position_y:
      requireInteger(
        input.position_y,
        "position_y"
      ),

    motion_state:
      motionState,
  });
}

export {
  MOTION_STATE,
};
