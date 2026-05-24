import {
  apiGet,
} from "@/api/services/baseApiService";

export async function fetchRemoteHomepage() {

  return apiGet({

    url:
      "/cms/homepage",

  });

}