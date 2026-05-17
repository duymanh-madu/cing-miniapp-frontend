import {
  useEffect,
} from "react";

import {
  useCmsStore,
} from "../store/cmsStore";

import {
  fetchRemoteHomepage,
} from "../services/remoteHomepageService";

import {
  fetchFeatureFlags,
} from "../services/featureFlagService";

import {
  fetchCampaignConfigs,
} from "../services/campaignConfigService";

export function useRemoteCms() {

  useEffect(() => {

    async function load() {

      const [

        homepage,

        flags,

        campaigns,

      ] = await Promise.all([

        fetchRemoteHomepage(),

        fetchFeatureFlags(),

        fetchCampaignConfigs(),

      ]);

      useCmsStore
        .getState()
        .setHomepageBlocks(
          homepage
        );

      useCmsStore
        .getState()
        .setFeatureFlags(
          flags
        );

      useCmsStore
        .getState()
        .setActiveCampaigns(
          campaigns
        );

    }

    load();

  }, []);

}