import {
  useCustomerRealtime,
} from "../shared/hooks/useCustomerRealtime";

import RealtimeReconnectBanner from "../components/RealtimeReconnectBanner";

import RecentRewardsWidget from "../components/RecentRewardsWidget";

import RecentOrdersWidget from "../components/RecentOrdersWidget";

import InstantLoadingOverlay from "../components/InstantLoadingOverlay";

function CustomerRealtimePage() {

  useCustomerRealtime();

  return (

    <div className="space-y-4 p-4">

      <RealtimeReconnectBanner />

      <InstantLoadingOverlay />

      <RecentRewardsWidget />

      <RecentOrdersWidget />

    </div>

  );

}

export default CustomerRealtimePage;