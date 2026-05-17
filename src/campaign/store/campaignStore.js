import { create }
  from "zustand";

export const useCampaignStore =
  create((set) => ({

    activeCampaigns: [],

    featuredBanners: [],

    campaignWidgets: [],

    setActiveCampaigns(campaigns) {

      set({

        activeCampaigns:
          campaigns,

      });

    },

    setFeaturedBanners(banners) {

      set({

        featuredBanners:
          banners,

      });

    },

    setCampaignWidgets(widgets) {

      set({

        campaignWidgets:
          widgets,

      });

    },

  }));