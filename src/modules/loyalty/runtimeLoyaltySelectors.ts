import {
  useRuntimeLoyaltyExperienceStore,
} from "./runtimeLoyaltyExperienceStore";

export function getRuntimeLoyaltyState() {

  return useRuntimeLoyaltyExperienceStore
    .getState();

}