import { socket } from "../socketClient";

import {
  realtimeGamificationRegistry,
} from "./realtimeGamificationRegistry";

import {
  trackReceived,
  trackProcessed,
  trackFailed,
} from "./realtimeGamificationMetrics";

import { useGamificationStore }
  from "@/stores/useGamificationStore";

import { useLeaderboardStore }
  from "@/stores/useLeaderboardStore";

/**
 * =====================================================
 * GOVERNANCE
 * =====================================================
 */

let initialized = false;

const registeredHandlers =
  new Map();

/**
 * =====================================================
 * BIND GAMIFICATION EVENTS
 * =====================================================
 */

export function bindGamificationRealtime() {

  /**
   * ===================================================
   * DUPLICATE PROTECTION
   * ===================================================
   */

  if (initialized) {

    return;

  }

  initialized = true;

  Object.entries(
    realtimeGamificationRegistry
  ).forEach(
    ([
      event,
      handler,
    ]) => {

      /**
       * ===============================================
       * STABLE HANDLER
       * ===============================================
       */

      const stableHandler =
        (payload) => {

          try {

            trackReceived();

            handler({

              payload,

              gamificationStore:
                useGamificationStore,

              leaderboardStore:
                useLeaderboardStore,

            });

            trackProcessed();

          } catch (
            error
          ) {

            trackFailed();

            console.error(
              `Gamification realtime error: ${event}`,
              error
            );

          }

        };

      registeredHandlers.set(
        event,
        stableHandler
      );

      socket.on(
        event,
        stableHandler
      );

    }
  );

}

/**
 * =====================================================
 * DESTROY
 * =====================================================
 */

export function destroyGamificationRealtime() {

  registeredHandlers.forEach(
    (
      handler,
      event
    ) => {

      socket.off(
        event,
        handler
      );

    }
  );

  registeredHandlers.clear();

  initialized = false;

}