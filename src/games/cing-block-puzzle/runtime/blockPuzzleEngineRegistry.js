import * as engineV1 from "../engine/index.js";
import * as engineV2 from "../engine/v2/index.js";
import * as engineV3 from "../engine/v3/index.js";

const CONTRACT_V1 =
  Object.freeze({
    engineVersion: 1,
    rulesVersion: 1,
    scoreVersion: 1,
    replayVersion: 1,
  });

const CONTRACT_V2 =
  Object.freeze({
    engineVersion: 2,
    rulesVersion: 2,
    scoreVersion: 2,
    replayVersion: 2,
  });

const CONTRACT_V3 =
  Object.freeze({
    engineVersion: 2,
    rulesVersion: 2,
    scoreVersion: 2,
    replayVersion: 3,
  });

function matchesContract(
  contract,
  supported
) {
  return (
    contract.engineVersion ===
      supported.engineVersion &&
    contract.rulesVersion ===
      supported.rulesVersion &&
    contract.scoreVersion ===
      supported.scoreVersion &&
    contract.replayVersion ===
      supported.replayVersion
  );
}

export function
getBlockPuzzleEngineForContract({
  engine_version,
  rules_version,
  score_version,
  replay_version,
}) {
  const contract = {
    engineVersion:
      Number(engine_version),

    rulesVersion:
      Number(rules_version),

    scoreVersion:
      Number(score_version),

    replayVersion:
      Number(replay_version),
  };

  if (
    matchesContract(
      contract,
      CONTRACT_V1
    )
  ) {
    return engineV1;
  }

  if (
    matchesContract(
      contract,
      CONTRACT_V2
    )
  ) {
    return engineV2;
  }

  if (
    matchesContract(
      contract,
      CONTRACT_V3
    )
  ) {
    return engineV3;
  }

  const error =
    new Error(
      "Unsupported Cing Block Puzzle deterministic engine contract"
    );

  error.code =
    "BLOCK_PUZZLE_UNSUPPORTED_ENGINE_CONTRACT";

  throw error;
}

export {
  CONTRACT_V1,
  CONTRACT_V2,
};
