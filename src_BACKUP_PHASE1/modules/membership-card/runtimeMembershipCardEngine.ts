import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  hydrateMembershipCard,
} from "./runtimeMembershipCardHydrator";

import {
  calculateNextTier,
} from "./runtimeMembershipCardUtils";

import {
  calculateMembershipProgress,
} from "./runtimeMembershipProgressEngine";

import {

  useRuntimeMembershipCardStore,
} from "./runtimeMembershipCardStore";

export async function initializeMembershipCardEngine() {

  runtimeLogger.info("APP", 
    "[CARD] Membership card initializing"
  );

  const card =
    await hydrateMembershipCard();

  const nextTierData =
    calculateNextTier(
      card.totalSpent
    );

  const progress =
    calculateMembershipProgress(
      card.totalSpent,
      card.totalSpent +
      nextTierData.remaining
    );

  const runtimeCard = {
    ...card,
    nextTier:
      nextTierData.nextTier,
    remaining:
      nextTierData.remaining,
    progress,
  };

  useRuntimeMembershipCardStore
    .getState()
    .setCard(
      runtimeCard
    );

  runtimeLogger.info("APP", 
    "[CARD] Membership card ready",
    runtimeCard
  );

}