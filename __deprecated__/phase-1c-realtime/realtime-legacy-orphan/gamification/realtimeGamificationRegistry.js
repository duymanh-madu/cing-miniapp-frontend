import {

  REALTIME_GAMIFICATION_EVENTS,

} from "./realtimeGamificationEvents";

import {

  realtimeXPHandler,

} from "./realtimeXPHandler";

import {

  realtimeLevelHandler,

} from "./realtimeLevelHandler";

import {

  realtimeLeaderboardHandler,

} from "./realtimeLeaderboardHandler";

import {

  realtimeAchievementHandler,

} from "./realtimeAchievementHandler";

import {

  realtimeComboHandler,

} from "./realtimeComboHandler";

/**
 * =====================================================
 * REGISTRY
 * =====================================================
 */

export const realtimeGamificationRegistry = {

  [
    REALTIME_GAMIFICATION_EVENTS
      .XP_UPDATED
  ]:
    realtimeXPHandler,

  [
    REALTIME_GAMIFICATION_EVENTS
      .LEVEL_UPDATED
  ]:
    realtimeLevelHandler,

  [
    REALTIME_GAMIFICATION_EVENTS
      .LEADERBOARD_UPDATED
  ]:
    realtimeLeaderboardHandler,

  [
    REALTIME_GAMIFICATION_EVENTS
      .ACHIEVEMENT_UNLOCKED
  ]:
    realtimeAchievementHandler,

  [
    REALTIME_GAMIFICATION_EVENTS
      .COMBO_UPDATED
  ]:
    realtimeComboHandler,

};