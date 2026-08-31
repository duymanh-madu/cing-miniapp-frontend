import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";

const read =
  (path) =>
    fs.readFileSync(
      path,
      "utf8"
    );

test(
  "Cing Piu Piu is self-managed in loader and registry",
  () => {
    const loader =
      read(
        "src/game-system/loaders/GameLoader.jsx"
      );

    const registry =
      read(
        "src/games/registry/gameRegistry.js"
      );

    assert.match(
      loader,
      /"cing-artillery"[\s\S]*?SELF_MANAGED/u
    );

    assert.match(
      registry,
      /"cing-artillery"[\s\S]*?SELF_MANAGED/u
    );

    assert.match(
      registry,
      /displayName:\s*"Cing Piu Piu"/u
    );

    assert.match(
      registry,
      /leaderboardEnabled:\s*false/u
    );
  }
);

test(
  "authority client uses canonical authenticated HTTP surface",
  () => {
    const source =
      read(
        "src/games/cing-artillery/runtime/cingArtilleryAuthorityClient.js"
      );

    assert.match(
      source,
      /\/game\/cing-piu-piu/u
    );

    assert.match(
      source,
      /`\$\{BASE\}\/entry`/u
    );

    assert.match(
      source,
      /`\$\{BASE\}\/session`/u
    );

    assert.match(
      source,
      /`\$\{BASE\}\/matchmaking`/u
    );

    assert.match(
      source,
      /gameplay_session_id/u
    );

    assert.doesNotMatch(
      source,
      /\buser_id\b|\buserId\b/u
    );

    assert.doesNotMatch(
      source,
      /\/game\/use-play/u
    );
  }
);

test(
  "Cing Piu Piu realtime owns dedicated game-server transport",
  () => {
    const source =
      read(
        "src/games/cing-artillery/runtime/cingArtilleryRealtimeClient.js"
      );

    assert.match(
      source,
      /VITE_GAME_SERVER_URL/u
    );

    assert.match(
      source,
      /auth:\s*\{\s*token/u
    );

    assert.match(
      source,
      /cing-artillery:match:join/u
    );

    assert.match(
      source,
      /cing-artillery:match:readiness/u
    );

    assert.match(
      source,
      /cing-artillery:match:turn-state/u
    );

    assert.match(
      source,
      /cing-artillery:match:start-error/u
    );

    assert.doesNotMatch(
      source,
      /runtimeSocketClient/u
    );

    assert.doesNotMatch(
      source,
      /cing-backend-production/u
    );

    assert.doesNotMatch(
      source,
      /game\.madu\.com\.vn/u
    );
  }
);

test(
  "5J2 lobby remains separate from battle fire authority",
  () => {
    const source =
      read(
        "src/games/cing-artillery/CingArtilleryGame.jsx"
      );

    assert.match(
      source,
      /createCingArtilleryGameplaySession/u
    );

    assert.match(
      source,
      /enterCingArtilleryMatchmaking/u
    );

    assert.match(
      source,
      /joinMatch/u
    );

    assert.match(
      source,
      /handleBattleFireIntent/u
    );

    assert.match(
      source,
      /snapshot\.turn[\s\S]*active_account_id/u
    );

    assert.match(
      source,
      /snapshot\.viewer[\s\S]*account_id/u
    );
  }
);

test(
  "Game Center hides Cing Piu Piu until private entry authority allows discovery",
  () => {
    const source =
      read(
        "src/features/game-center/pages/GameCenterPage.jsx"
      );

    const registry =
      read(
        "src/games/registry/gameRegistry.js"
      );

    assert.match(
      source,
      /cingArtilleryVisible/u
    );

    assert.match(
      source,
      /game\.id !== "cing-artillery"/u
    );

    assert.match(
      source,
      /\/game\/cing-piu-piu\/entry/u
    );

    assert.match(
      source,
      /setCingArtilleryVisible\(false\)/u
    );

    assert.match(
      registry,
      /"cing-artillery"[\s\S]*?privateBeta:\s*true/u
    );
  }
);
