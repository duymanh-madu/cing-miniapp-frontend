import {
  apiGet,
} from "@/api/services/baseApiService";

export async function fetchFeatureFlags() {

  return apiGet({

    url:
      "/cms/feature-flags",

  });

}