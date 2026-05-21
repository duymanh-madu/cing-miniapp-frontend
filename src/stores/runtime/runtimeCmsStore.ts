import { create } from "zustand";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */

interface CmsBlock {

  type: string;

  title?: string;

  content?: string;

}

interface RuntimeCmsState {

  homepage_blocks:
    CmsBlock[];

  active_campaigns:
    any[];

  setHomepageBlocks: (
    blocks: CmsBlock[]
  ) => void;

  setActiveCampaigns: (
    campaigns: any[]
  ) => void;

}

/**
 * =====================================================
 * STORE
 * =====================================================
 */

export const useRuntimeCmsStore =
  create<
    RuntimeCmsState
  >(

    (
      set
    ) => ({

      homepage_blocks:
        [],

      active_campaigns:
        [],

      setHomepageBlocks: (
        blocks
      ) =>

        set({

          homepage_blocks:
            blocks,

        }),

      setActiveCampaigns: (
        campaigns
      ) =>

        set({

          active_campaigns:
            campaigns,

        }),

    })

  );