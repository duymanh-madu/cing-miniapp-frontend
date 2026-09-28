import assert from
  "node:assert/strict";

import {
  test,
} from "node:test";

import {
  getBlockPuzzleEngineForContract,
} from "../runtime/blockPuzzleEngineRegistry.js";

import {
  persistBlockPuzzleRuntime,
  restoreBlockPuzzleRecovery,
} from "../runtime/blockPuzzleRecovery.js";

const OWNER =
  "0912345678";

const SESSION_ID =
  "11111111-1111-4111-8111-111111111111";

const REQUEST_ID =
  "22222222-2222-4222-8222-222222222222";

const V4 =
  Object.freeze({
    engine_version: 3,
    rules_version: 3,
    score_version: 3,
    replay_version: 4,
  });

const V5 =
  Object.freeze({
    engine_version: 4,
    rules_version: 4,
    score_version: 3,
    replay_version: 5,
  });

function storage() {
  const values =
    new Map();

  return {
    getItem(key) {
      return values.has(key)
        ? values.get(key)
        : null;
    },

    setItem(key, value) {
      values.set(
        key,
        String(value)
      );
    },

    removeItem(key) {
      values.delete(key);
    },

    keys() {
      return [
        ...values.keys(),
      ];
    },
  };
}

function createRuntime(
  contract,
  playCost
) {
  const session = {
    session_id:
      SESSION_ID,

    seed:
      12345,

    ...contract,

    play_cost:
      playCost,

    expires_at:
      "2030-01-01T00:00:00.000Z",
  };

  const engine =
    getBlockPuzzleEngineForContract(
      session
    );

  return {
    session,

    replay:
      engine.createReplayTranscript(
        session.seed
      ),
  };
}

function roundTrip(
  contract,
  playCost
) {
  const target =
    storage();

  const runtime =
    createRuntime(
      contract,
      playCost
    );

  const persisted =
    persistBlockPuzzleRuntime({
      ownerKey: OWNER,
      requestId: REQUEST_ID,
      runtime,
      storage: target,
    });

  return {
    persisted,
    recovered:
      restoreBlockPuzzleRecovery({
        ownerKey: OWNER,
        storage: target,
      }),
    keys:
      target.keys(),
  };
}

test(
  "V5 Free Start runtime survives recovery V1",
  () => {
    const result =
      roundTrip(
        V5,
        0
      );

    assert.equal(
      result.persisted,
      true
    );

    assert.equal(
      result.recovered.session.play_cost,
      0
    );

    assert.equal(
      result.recovered.session.engine_version,
      4
    );

    assert.equal(
      result.recovered.replay.replayVersion,
      5
    );
  }
);

test(
  "V4 Free Start runtime survives recovery V1",
  () => {
    const result =
      roundTrip(
        V4,
        0
      );

    assert.equal(
      result.persisted,
      true
    );

    assert.equal(
      result.recovered.session.play_cost,
      0
    );
  }
);

test(
  "historical V4 play_cost=1 remains recoverable",
  () => {
    const result =
      roundTrip(
        V4,
        1
      );

    assert.equal(
      result.persisted,
      true
    );

    assert.equal(
      result.recovered.session.play_cost,
      1
    );
  }
);

test(
  "invalid play_cost=2 fails closed",
  () => {
    const result =
      roundTrip(
        V5,
        2
      );

    assert.equal(
      result.persisted,
      false
    );

    assert.equal(
      result.recovered,
      null
    );
  }
);

test(
  "invalid negative play_cost fails closed",
  () => {
    const result =
      roundTrip(
        V5,
        -1
      );

    assert.equal(
      result.persisted,
      false
    );
  }
);

test(
  "recovery continues using exact V1 storage key",
  () => {
    const result =
      roundTrip(
        V5,
        0
      );

    assert.deepEqual(
      result.keys,
      [
        "cing_block_puzzle_recovery_v1",
      ]
    );
  }
);

test(
  "V4 and V5 recovery remain version-distinct",
  () => {
    const v4 =
      roundTrip(
        V4,
        1
      );

    const v5 =
      roundTrip(
        V5,
        0
      );

    assert.equal(
      v4.recovered.replay.replayVersion,
      4
    );

    assert.equal(
      v5.recovered.replay.replayVersion,
      5
    );

    assert.notDeepEqual(
      v4.recovered.session,
      v5.recovered.session
    );
  }
);
