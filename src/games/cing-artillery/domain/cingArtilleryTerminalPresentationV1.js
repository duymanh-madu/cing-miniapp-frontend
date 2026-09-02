const TERMINAL_PRESENTATION_VERSION_V1 =
  "cing-artillery-terminal-presentation-v1";

const TERMINAL_STATUS_V1 =
  Object.freeze({
    INITIALIZED:
      "initialized",

    COMPLETED:
      "completed",
  });

const TERMINAL_COMPLETION_REASON_V1 =
  Object.freeze({
    HP_DEPLETED:
      "hp_depleted",

    FELL_OUT_OF_WORLD:
      "fell_out_of_world",
  });

function normalizeRequiredIdentityV1(
  value,
  field
) {
  if (
    typeof value !==
      "string" ||
    value.trim() !==
      value ||
    value.length ===
      0
  ) {
    throw new Error(
      `CING_PIU_PIU_TERMINAL_${field}_INVALID`
    );
  }

  return value;
}

function projectTerminalPresentationV1(
  snapshot
) {
  if (
    !snapshot ||
    typeof snapshot !==
      "object"
  ) {
    throw new Error(
      "CING_PIU_PIU_TERMINAL_SNAPSHOT_INVALID"
    );
  }

  const terminal =
    snapshot.terminal;

  if (
    !terminal ||
    typeof terminal !==
      "object"
  ) {
    throw new Error(
      "CING_PIU_PIU_TERMINAL_AUTHORITY_MISSING"
    );
  }

  const viewerAccountId =
    normalizeRequiredIdentityV1(
      snapshot.viewer
        ?.account_id,
      "VIEWER"
    );

  const playerOneAccountId =
    normalizeRequiredIdentityV1(
      snapshot.players
        ?.player_one
        ?.account_id,
      "PLAYER_ONE"
    );

  const playerTwoAccountId =
    normalizeRequiredIdentityV1(
      snapshot.players
        ?.player_two
        ?.account_id,
      "PLAYER_TWO"
    );

  if (
    viewerAccountId !==
      playerOneAccountId &&
    viewerAccountId !==
      playerTwoAccountId
  ) {
    throw new Error(
      "CING_PIU_PIU_TERMINAL_VIEWER_NOT_PARTICIPANT"
    );
  }

  if (
    terminal.status ===
      TERMINAL_STATUS_V1
        .INITIALIZED
  ) {
    if (
      terminal
        .winner_account_id !==
        null ||
      terminal
        .loser_account_id !==
        null ||
      terminal
        .completion_reason !==
        null ||
      terminal.completed_at !==
        null
    ) {
      throw new Error(
        "CING_PIU_PIU_NONTERMINAL_AUTHORITY_INVALID"
      );
    }

    return Object.freeze({
      version:
        TERMINAL_PRESENTATION_VERSION_V1,

      completed:
        false,

      viewerResult:
        null,

      winnerAccountId:
        null,

      loserAccountId:
        null,

      completionReason:
        null,

      completedAt:
        null,
    });
  }

  if (
    terminal.status !==
      TERMINAL_STATUS_V1
        .COMPLETED
  ) {
    throw new Error(
      "CING_PIU_PIU_TERMINAL_STATUS_INVALID"
    );
  }

  const winnerAccountId =
    normalizeRequiredIdentityV1(
      terminal
        .winner_account_id,
      "WINNER"
    );

  const loserAccountId =
    normalizeRequiredIdentityV1(
      terminal
        .loser_account_id,
      "LOSER"
    );

  if (
    winnerAccountId ===
      loserAccountId ||
    ![
      playerOneAccountId,
      playerTwoAccountId,
    ].includes(
      winnerAccountId
    ) ||
    ![
      playerOneAccountId,
      playerTwoAccountId,
    ].includes(
      loserAccountId
    )
  ) {
    throw new Error(
      "CING_PIU_PIU_TERMINAL_PARTICIPANTS_INVALID"
    );
  }

  if (
    !Object.values(
      TERMINAL_COMPLETION_REASON_V1
    ).includes(
      terminal
        .completion_reason
    )
  ) {
    throw new Error(
      "CING_PIU_PIU_TERMINAL_REASON_INVALID"
    );
  }

  const completedAt =
    normalizeRequiredIdentityV1(
      terminal.completed_at,
      "COMPLETED_AT"
    );

  const viewerResult =
    viewerAccountId ===
      winnerAccountId
      ? "victory"
      : viewerAccountId ===
          loserAccountId
        ? "defeat"
        : null;

  if (!viewerResult) {
    throw new Error(
      "CING_PIU_PIU_TERMINAL_VIEWER_RESULT_INVALID"
    );
  }

  return Object.freeze({
    version:
      TERMINAL_PRESENTATION_VERSION_V1,

    completed:
      true,

    viewerResult,

    winnerAccountId,

    loserAccountId,

    completionReason:
      terminal
        .completion_reason,

    completedAt,
  });
}

export {
  TERMINAL_COMPLETION_REASON_V1,
  TERMINAL_PRESENTATION_VERSION_V1,
  TERMINAL_STATUS_V1,
  projectTerminalPresentationV1,
};
