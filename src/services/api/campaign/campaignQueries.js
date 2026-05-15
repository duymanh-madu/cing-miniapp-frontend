import {
  useQuery,
} from "@tanstack/react-query";

import {
  CAMPAIGN_QUERY_KEYS,
} from "./campaignQueryKeys";

import {
  fetchCampaigns,
} from "./campaignService";

import {
  createQueryOptions,
} from "@/services/query/createQueryOptions";

export function useCampaignsQuery() {
  return useQuery(
    createQueryOptions({
      queryKey:
        CAMPAIGN_QUERY_KEYS.ALL,

      queryFn:
        fetchCampaigns,

      policy:
        "standard",
    })
  );
}