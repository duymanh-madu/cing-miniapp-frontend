const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EVENT_ID =
  /^[1-9][0-9]*$/;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function requireSessionId(value) {
  if (
    typeof value !== "string" ||
    !UUID.test(value)
  ) {
    fail("REVIVAL_SESSION_INVALID");
  }

  return value.toLowerCase();
}

function requireSequence(value) {
  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value >= 2147483647
  ) {
    fail("REVIVAL_SEQUENCE_INVALID");
  }

  return value;
}

function requireRevives(value) {
  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > 5
  ) {
    fail("REVIVAL_COUNT_INVALID");
  }

  return value;
}

function requireEventId(value) {
  const text =
    typeof value === "string"
      ? value
      : Number.isSafeInteger(value)
        ? String(value)
        : "";

  if (
    !EVENT_ID.test(text) ||
    BigInt(text) > 9223372036854775807n
  ) {
    fail("REVIVAL_EVENT_INVALID");
  }

  return text;
}

export function createOfflineRevivalLifecycleCoordinator({
  sessionId,
  eventSeq,
  revivesUsed,
  createRequestId,
  markPending,
  applyRevival,
}) {
  const id =
    requireSessionId(sessionId);

  let sequence =
    requireSequence(eventSeq);

  let used =
    requireRevives(revivesUsed);

  if (
    typeof createRequestId !== "function" ||
    typeof markPending !== "function" ||
    typeof applyRevival !== "function"
  ) {
    fail("REVIVAL_COORDINATOR_CONFIG_INVALID");
  }

  let status = "active";
  let pendingEventId = null;
  let pendingReason = null;

  let pendingRequestId = null;
  let reviveRequestId = null;

  let busy = false;

  function snapshot() {
    return Object.freeze({
      session_id: id,
      event_seq: sequence,
      revives_used: used,
      status,
      pending_event_id: pendingEventId,
      pending_reason: pendingReason,
      busy,
    });
  }

  async function enterPending(reason) {
    if (
      reason !== "death" &&
      reason !== "timeout"
    ) {
      fail("REVIVAL_REASON_INVALID");
    }

    if (busy) {
      return {
        status: "busy",
        state: snapshot(),
      };
    }

    if (status === "revive_pending") {
      return {
        status: "already_pending",
        state: snapshot(),
      };
    }

    if (status !== "active") {
      fail("REVIVAL_STATE_INVALID");
    }

    if (
      pendingRequestId &&
      pendingReason !== reason
    ) {
      fail("REVIVAL_PENDING_RETRY_CONFLICT");
    }

    busy = true;

    try {
      if (!pendingRequestId) {
        pendingRequestId =
          createRequestId();

        requireSessionId(
          pendingRequestId
        );

        pendingReason = reason;
      }

      const result =
        await markPending({
          sessionId: id,
          requestId:
            pendingRequestId,
          expectedEventSeq:
            sequence,
          reason,
        });

      if (
        (
          result?.applied !== true &&
          result?.applied !== false
        ) ||
        result.session_id !== id ||
        result.session_status !==
          "revive_pending" ||
        result.event_seq !==
          sequence + 1 ||
        result.revives_used !== used ||
        result.pending_reason !== reason
      ) {
        fail(
          "REVIVAL_PENDING_RESPONSE_INVALID"
        );
      }

      const eventId =
        requireEventId(
          result.event_id
        );

      sequence =
        result.event_seq;

      pendingEventId =
        eventId;

      status =
        "revive_pending";

      pendingRequestId = null;

      return {
        status: "pending",
        state: snapshot(),
      };
    } finally {
      busy = false;
    }
  }

  async function revive() {
    if (busy) {
      return {
        status: "busy",
        state: snapshot(),
      };
    }

    if (
      status !== "revive_pending" ||
      !pendingEventId
    ) {
      fail(
        "REVIVAL_NOT_PENDING"
      );
    }

    if (used >= 5) {
      fail(
        "REVIVAL_LIMIT_REACHED"
      );
    }

    busy = true;

    try {
      if (!reviveRequestId) {
        reviveRequestId =
          createRequestId();

        requireSessionId(
          reviveRequestId
        );
      }

      const result =
        await applyRevival({
          sessionId: id,
          requestId:
            reviveRequestId,
          expectedEventSeq:
            sequence,
          pendingEventId,
        });

      if (
        (
          result?.applied !== true &&
          result?.applied !== false
        ) ||
        result.session_id !== id ||
        result.session_status !==
          "active" ||
        result.event_seq !==
          sequence + 1 ||
        result.revive_index !==
          used + 1 ||
        result.credit_cost !==
          2 ** used
      ) {
        fail(
          "REVIVAL_APPLY_RESPONSE_INVALID"
        );
      }

      sequence =
        result.event_seq;

      used =
        result.revive_index;

      status =
        "active";

      pendingEventId = null;
      pendingReason = null;

      reviveRequestId = null;

      return {
        status: "resumed",
        state: snapshot(),
      };
    } finally {
      busy = false;
    }
  }

  return Object.freeze({
    snapshot,
    enterPending,
    revive,
  });
}
