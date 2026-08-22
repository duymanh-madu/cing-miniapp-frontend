import {
  lazy,
} from "react";

import {
  GAME_RUNTIME_AUTHORITY,
} from "../../games/registry/gameRuntimeAuthority.js";

const gameModules = {
  "black-pearl-rush": {
    component:
      lazy(
        () =>
          import(
            "../../games/black-pearl-rush"
          )
      ),

    runtimeAuthority:
      GAME_RUNTIME_AUTHORITY
        .LEGACY_GENERIC,
  },

  "cing-stack-tower": {
    component:
      lazy(
        () =>
          import(
            "../../games/cing-stack-tower"
          )
      ),

    runtimeAuthority:
      GAME_RUNTIME_AUTHORITY
        .LEGACY_GENERIC,
  },

  "cing-artillery": {
    component:
      lazy(
        () =>
          import(
            "../../games/cing-artillery"
          )
      ),

    /*
     * Preserve current loader behavior.
     * Artillery authority migration is outside
     * Block Puzzle integration scope.
     */
    runtimeAuthority:
      GAME_RUNTIME_AUTHORITY
        .LEGACY_GENERIC,
  },

  "cing-block-puzzle": {
    component:
      lazy(
        () =>
          import(
            "../../games/cing-block-puzzle"
          )
      ),

    runtimeAuthority:
      GAME_RUNTIME_AUTHORITY
        .SELF_MANAGED,
  },
};

export default function
GameLoader({
  gameId,
  onGameOver,
}) {
  const definition =
    gameModules[
      gameId
    ];

  if (!definition) {
    return (
      <div>
        Game Not Found
      </div>
    );
  }

  const Component =
    definition.component;

  if (
    definition
      .runtimeAuthority ===
    GAME_RUNTIME_AUTHORITY
      .SELF_MANAGED
  ) {
    return (
      <Component />
    );
  }

  if (
    definition
      .runtimeAuthority !==
    GAME_RUNTIME_AUTHORITY
      .LEGACY_GENERIC
  ) {
    return (
      <div>
        Game Runtime Not Supported
      </div>
    );
  }

  return (
    <Component
      onGameOver={
        onGameOver
      }
    />
  );
}
