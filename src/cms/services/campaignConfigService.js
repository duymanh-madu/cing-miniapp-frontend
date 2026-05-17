import {
  apiGet,
} from "@/api/services/baseApiService";

export async function fetchCampaignConfigs() {

  return apiGet({

    url:
      "/cms/campaigns",

  });

}