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

  from "../../stores/useGamificationStore";

import { useLeaderboardStore }

  from "../../stores/useLeaderboardStore";

/**
 * =====================================================
 * BIND GAMIFICATION EVENTS
 * =====================================================
 */

export function bindGamificationRealtime() {

  Object.entries(

    realtimeGamificationRegistry

  ).forEach(

    ([

      event,

      handler,

    ]) => {

      socket.on(

        event,

        (

          payload

        ) => {

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

        }

      );

    }

  );

}