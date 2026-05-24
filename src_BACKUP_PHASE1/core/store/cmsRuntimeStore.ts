import { create } from "zustand";

interface CmsRuntimeState {

  banners: any[];

  popupCampaigns: any[];

  featuredProducts: any[];

  setCmsState: (
    payload: {

      banners: any[];

      popupCampaigns: any[];

      featuredProducts: any[];

    }
  ) => void;

}

export const useCmsRuntimeStore =
  create<CmsRuntimeState>(

    (
      set
    ) => ({

      banners: [],

      popupCampaigns: [],

      featuredProducts: [],

      setCmsState: (
        payload
      ) => set({

        banners:
          payload.banners,

        popupCampaigns:
          payload.popupCampaigns,

        featuredProducts:
          payload.featuredProducts,

      }),

    })

  );