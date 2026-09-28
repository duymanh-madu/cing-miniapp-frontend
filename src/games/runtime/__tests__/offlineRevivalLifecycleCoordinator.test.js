import test from "node:test";
import assert from "node:assert/strict";

import {
  createOfflineRevivalLifecycleCoordinator,
} from "../offlineRevivalLifecycleCoordinator.js";

const SESSION =
  "11111111-1111-4111-8111-111111111111";

const REQUEST =
  "22222222-2222-4222-8222-222222222222";

function fixture({
  markPending,
  applyRevival,
  revivesUsed = 0,
} = {}) {
  const calls = [];

  const coordinator =
    createOfflineRevivalLifecycleCoordinator({
      sessionId: SESSION,
      eventSeq: 0,
      revivesUsed,
      createRequestId:
        () => REQUEST,

      markPending:
        markPending ||
        (async (input) => {
          calls.push([
            "pending",
            input,
          ]);

          return {
            applied: true,
            session_id: SESSION,
            event_id: "9007199254740993",
            session_status:
              "revive_pending",
            event_seq: 1,
            revives_used:
              revivesUsed,
            pending_reason:
              input.reason,
          };
        }),

      applyRevival:
        applyRevival ||
        (async (input) => {
          calls.push([
            "revive",
            input,
          ]);

          return {
            applied: true,
            session_id: SESSION,
            session_status:
              "active",
            event_seq: 2,
            revive_index:
              revivesUsed + 1,
            credit_cost:
              2 ** revivesUsed,
          };
        }),
    });

  return {
    coordinator,
    calls,
  };
}

test(
  "pending precedes revival",
  async () => {
    const { coordinator } =
      fixture();

    await assert.rejects(
      coordinator.revive(),
      {
        code:
          "REVIVAL_NOT_PENDING",
      }
    );
  }
);

test(
  "death enters pending",
  async () => {
    const { coordinator } =
      fixture();

    const result =
      await coordinator.enterPending(
        "death"
      );

    assert.equal(
      result.status,
      "pending"
    );

    assert.equal(
      result.state.event_seq,
      1
    );

    assert.equal(
      result.state.pending_event_id,
      "9007199254740993"
    );
  }
);

test(
  "revival resumes same session",
  async () => {
    const {
      coordinator,
      calls,
    } = fixture();

    await coordinator.enterPending(
      "death"
    );

    const result =
      await coordinator.revive();

    assert.equal(
      result.status,
      "resumed"
    );

    assert.equal(
      result.state.session_id,
      SESSION
    );

    assert.equal(
      result.state.revives_used,
      1
    );

    assert.equal(
      result.state.event_seq,
      2
    );

    assert.equal(
      calls[1][1].pendingEventId,
      "9007199254740993"
    );
  }
);

test(
  "ambiguous pending failure retains request ID",
  async () => {
    const seen = [];
    let attempt = 0;

    const { coordinator } =
      fixture({
        markPending:
          async (input) => {
            seen.push(input);
            attempt += 1;

            if (attempt === 1) {
              throw new Error(
                "network"
              );
            }

            return {
              applied: true,
              session_id: SESSION,
              event_id: "42",
              session_status:
                "revive_pending",
              event_seq: 1,
              revives_used: 0,
              pending_reason:
                "death",
            };
          },
      });

    await assert.rejects(
      coordinator.enterPending(
        "death"
      )
    );

    await coordinator.enterPending(
      "death"
    );

    assert.equal(
      seen[0].requestId,
      seen[1].requestId
    );
  }
);

test(
  "ambiguous revive failure retains request ID",
  async () => {
    const seen = [];
    let attempt = 0;

    const { coordinator } =
      fixture({
        applyRevival:
          async (input) => {
            seen.push(input);
            attempt += 1;

            if (attempt === 1) {
              throw new Error(
                "network"
              );
            }

            return {
              applied: true,
              session_id: SESSION,
              session_status:
                "active",
              event_seq: 2,
              revive_index: 1,
              credit_cost: 1,
            };
          },
      });

    await coordinator.enterPending(
      "death"
    );

    await assert.rejects(
      coordinator.revive()
    );

    await coordinator.revive();

    assert.equal(
      seen[0].requestId,
      seen[1].requestId
    );
  }
);

test(
  "five revivals is the limit",
  async () => {
    const {
      coordinator,
    } = fixture({
      revivesUsed: 5,
    });

    await coordinator.enterPending(
      "timeout"
    );

    await assert.rejects(
      coordinator.revive(),
      {
        code:
          "REVIVAL_LIMIT_REACHED",
      }
    );
  }
);

test(
  "invalid apply response never resumes gameplay",
  async () => {
    const {
      coordinator,
    } = fixture({
      applyRevival:
        async () => ({
          applied: null,
          session_id: SESSION,
          session_status:
            "active",
          event_seq: 2,
          revive_index: 1,
          credit_cost: 1,
        }),
    });

    await coordinator.enterPending(
      "death"
    );

    await assert.rejects(
      coordinator.revive(),
      {
        code:
          "REVIVAL_APPLY_RESPONSE_INVALID",
      }
    );

    assert.equal(
      coordinator.snapshot()
        .status,
      "revive_pending"
    );
  }
);


test(
  "pending SQL replay is accepted",
  async () => {
    const { coordinator } = fixture({
      markPending: async (input) => ({
        applied: false,
        session_id: SESSION,
        event_id: "9007199254740993",
        session_status: "revive_pending",
        event_seq: 1,
        revives_used: 0,
        pending_reason: input.reason,
      }),
    });

    const result =
      await coordinator.enterPending("death");

    assert.equal(result.status, "pending");
    assert.equal(
      result.state.pending_event_id,
      "9007199254740993"
    );
    assert.equal(
      result.state.session_id,
      SESSION
    );
  }
);

test(
  "revive SQL replay is accepted without another debit",
  async () => {
    let applyCalls = 0;

    const { coordinator } = fixture({
      applyRevival: async () => {
        applyCalls += 1;

        return {
          applied: false,
          session_id: SESSION,
          session_status: "active",
          event_seq: 2,
          revive_index: 1,
          credit_cost: 1,
        };
      },
    });

    await coordinator.enterPending("death");

    const result =
      await coordinator.revive();

    assert.equal(result.status, "resumed");
    assert.equal(result.state.revives_used, 1);
    assert.equal(result.state.event_seq, 2);
    assert.equal(applyCalls, 1);
  }
);

test(
  "pending replay cannot resume a session already advanced",
  async () => {
    const { coordinator } = fixture({
      markPending: async () => ({
        applied: false,
        session_id: SESSION,
        event_id: "42",
        session_status: "active",
        event_seq: 1,
        revives_used: 0,
        pending_reason: "death",
      }),
    });

    await assert.rejects(
      coordinator.enterPending("death"),
      {
        code: "REVIVAL_PENDING_RESPONSE_INVALID",
      }
    );

    assert.equal(
      coordinator.snapshot().status,
      "active"
    );
  }
);

test(
  "revive replay cannot resume finalized session",
  async () => {
    const { coordinator } = fixture({
      applyRevival: async () => ({
        applied: false,
        session_id: SESSION,
        session_status: "finalized",
        event_seq: 2,
        revive_index: 1,
        credit_cost: 1,
      }),
    });

    await coordinator.enterPending("death");

    await assert.rejects(
      coordinator.revive(),
      {
        code: "REVIVAL_APPLY_RESPONSE_INVALID",
      }
    );

    assert.equal(
      coordinator.snapshot().status,
      "revive_pending"
    );
  }
);
