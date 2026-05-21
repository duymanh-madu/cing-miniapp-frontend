import {
  useCampaignsQuery,
} from "@/infra/api/campaign/campaignQueries";

export function useCampaignFeed() {
  const query =
    useCampaignsQuery();

  return {
    campaigns:
      query.data || [],

    isLoading:
      query.isLoading,

    error:
      query.error,
  };
}