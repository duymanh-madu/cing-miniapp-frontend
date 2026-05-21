import { create } from "zustand";

/**
 * =====================================================
 * STORE
 * =====================================================
 */

interface RuntimePersonalizationState {

  member_tier:
    string | null;

  segments:
    string[];

  homepage_variant:
    string | null;

  setPersonalization: (

    payload: Partial<
      RuntimePersonalizationState
    >

  ) => void;

}

export const useRuntimePersonalizationStore =
  create<
    RuntimePersonalizationState
  >(

    (
      set
    ) => ({

      member_tier:
        null,

      segments: [],

      homepage_variant:
        null,

      setPersonalization:
        (
          payload
        ) =>

          set(
            payload
          ),

    })

  );