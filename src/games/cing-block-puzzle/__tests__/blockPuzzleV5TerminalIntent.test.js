import assert from
  "node:assert/strict";

import {
  test,
} from "node:test";

import {
  persistBlockPuzzleTerminalIntent,
  restoreBlockPuzzleTerminalIntent,
  clearBlockPuzzleTerminalIntent,
} from "../runtime/blockPuzzleTerminalIntentRecovery.js";

import {
  getBlockPuzzleMaxContinues,
} from "../runtime/blockPuzzleContinueVersionPolicy.js";

const OWNER =
  "0912345678";

const SESSION_ID =
  "11111111-1111-4111-8111-111111111111";

const REQUEST_ID =
  "22222222-2222-4222-8222-222222222222";

const V4 = {
  session_id:
    SESSION_ID,

  engine_version: 3,
  rules_version: 3,
  score_version: 3,
  replay_version: 4,
};

const V5 = {
  session_id:
    SESSION_ID,

  engine_version: 4,
  rules_version: 4,
  score_version: 3,
  replay_version: 5,
};

function storage() {
  const map =
    new Map();

  return {
    getItem(key) {
      return map.has(key)
        ? map.get(key)
        : null;
    },

    setItem(key, value) {
      map.set(
        key,
        String(value)
      );
    },

    removeItem(key) {
      map.delete(key);
    },

    keys() {
      return [
        ...map.keys(),
      ];
    },
  };
}

function persist(
  target,
  session,
  index
) {
  return persistBlockPuzzleTerminalIntent({
    ownerKey: OWNER,
    sessionId: SESSION_ID,
    session,
    action:
      "continue_pending",
    requestId:
      REQUEST_ID,
    continueIndex:
      index,
    storage:
      target,
  });
}

function restore(
  target,
  session
) {
  return restoreBlockPuzzleTerminalIntent({
    ownerKey: OWNER,
    sessionId: SESSION_ID,
    session,
    storage:
      target,
  });
}

test(
  "V4 pending Continue 1-3 round-trip",
  () => {
    for (
      let index = 1;
      index <= 3;
      index += 1
    ) {
      const target =
        storage();

      assert.equal(
        persist(
          target,
          V4,
          index
        ),
        true
      );

      const intent =
        restore(
          target,
          V4
        );

      assert.equal(
        intent.continue_index,
        index
      );

      assert.equal(
        intent.request_id,
        REQUEST_ID
      );
    }
  }
);

test(
  "V4 refuses Continue 4-5",
  () => {
    for (
      const index of [
        4,
        5,
      ]
    ) {
      const target =
        storage();

      assert.equal(
        persist(
          target,
          V4,
          index
        ),
        false
      );

      assert.deepEqual(
        target.keys(),
        []
      );
    }
  }
);

test(
  "V5 pending Continue 1-5 round-trip",
  () => {
    for (
      let index = 1;
      index <= 5;
      index += 1
    ) {
      const target =
        storage();

      assert.equal(
        persist(
          target,
          V5,
          index
        ),
        true
      );

      const intent =
        restore(
          target,
          V5
        );

      assert.equal(
        intent.continue_index,
        index
      );

      assert.equal(
        intent.request_id,
        REQUEST_ID
      );

      assert.equal(
        getBlockPuzzleMaxContinues(
          V5
        ),
        5
      );
    }
  }
);

test(
  "V5 sixth Continue rejected",
  () => {
    const target =
      storage();

    assert.equal(
      persist(
        target,
        V5,
        6
      ),
      false
    );
  }
);

test(
  "legacy V1 terminal intent remains readable",
  () => {
    const target =
      storage();

    assert.equal(
      persistBlockPuzzleTerminalIntent({
        ownerKey: OWNER,
        sessionId: SESSION_ID,
        action:
          "continue_pending",
        requestId: REQUEST_ID,
        continueIndex: 3,
        storage: target,
      }),
      true
    );

    const intent =
      restoreBlockPuzzleTerminalIntent({
        ownerKey: OWNER,
        sessionId: SESSION_ID,
        storage: target,
      });

    assert.equal(
      intent.continue_index,
      3
    );

    assert.equal(
      intent.request_id,
      REQUEST_ID
    );
  }
);

test(
  "existing V1 caller cannot write fourth Continue",
  () => {
    const target =
      storage();

    assert.equal(
      persistBlockPuzzleTerminalIntent({
        ownerKey: OWNER,
        sessionId: SESSION_ID,
        action:
          "continue_pending",
        requestId: REQUEST_ID,
        continueIndex: 4,
        storage: target,
      }),
      false
    );
  }
);

test(
  "V5 pending request ID survives repeated restoration",
  () => {
    const target =
      storage();

    assert.equal(
      persist(
        target,
        V5,
        5
      ),
      true
    );

    const first =
      restore(
        target,
        V5
      );

    const second =
      restore(
        target,
        V5
      );

    assert.equal(
      first.request_id,
      REQUEST_ID
    );

    assert.equal(
      second.request_id,
      REQUEST_ID
    );

    assert.equal(
      second.continue_index,
      5
    );
  }
);

test(
  "wrong session ID cannot persist V5 intent",
  () => {
    const target =
      storage();

    assert.equal(
      persistBlockPuzzleTerminalIntent({
        ownerKey: OWNER,
        sessionId: SESSION_ID,

        session: {
          ...V5,
          session_id:
            "33333333-3333-4333-8333-333333333333",
        },

        action:
          "continue_pending",

        requestId:
          REQUEST_ID,

        continueIndex:
          4,

        storage:
          target,
      }),
      false
    );
  }
);

test(
  "legacy offer and submit intents retain V1 shape",
  () => {
    for (
      const action of [
        "offer",
        "submit_pending",
      ]
    ) {
      const target =
        storage();

      assert.equal(
        persistBlockPuzzleTerminalIntent({
          ownerKey: OWNER,
          sessionId: SESSION_ID,
          session: V5,
          action,
          storage: target,
        }),
        true
      );

      const restored =
        restore(
          target,
          V5
        );

      assert.equal(
        restored.action,
        action
      );

      assert.equal(
        restored.request_id,
        null
      );

      assert.equal(
        restored.continue_index,
        null
      );

      assert.deepEqual(
        target.keys(),
        [
          "cing_block_puzzle_terminal_intent_v1",
        ]
      );
    }
  }
);

test(
  "terminal intent clear retains historical behavior",
  () => {
    const target =
      storage();

    assert.equal(
      persist(
        target,
        V5,
        4
      ),
      true
    );

    assert.equal(
      clearBlockPuzzleTerminalIntent({
        storage: target,
      }),
      true
    );

    assert.equal(
      restore(
        target,
        V5
      ),
      null
    );
  }
);

test(
  "terminal policy rejects mixed V5 tuple",
  () => {
    const target =
      storage();

    assert.equal(
      persist(
        target,
        {
          ...V5,
          rules_version: 3,
        },
        4
      ),
      false
    );
  }
);
