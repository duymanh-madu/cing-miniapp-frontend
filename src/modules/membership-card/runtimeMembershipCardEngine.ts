import {
  hydrateMembershipCard,
} from "./runtimeMembershipCardHydrator";

import {
  calculateNextTier,
} from "./runtimeMembershipCardUtils";

import {
  calculateMembershipProgress,
} from "./runtimeMembershipProgressEngine";

export async function initializeMembershipCardEngine() {

  console.log(
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

  console.log(
    "[CARD] Membership card ready",
    {
      ...card,
      nextTier:
        nextTierData.nextTier,
      remaining:
        nextTierData.remaining,
      progress,
    }
  );

}