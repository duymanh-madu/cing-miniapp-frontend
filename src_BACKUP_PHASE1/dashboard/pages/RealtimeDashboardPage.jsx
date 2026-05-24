import LiveRevenuePulse from "../components/LiveRevenuePulse";

import OnlineCustomerWidget from "../components/OnlineCustomerWidget";

import LiveLeaderboardWidget from "../components/LiveLeaderboardWidget";

import RealtimeOrderTracker from "../components/RealtimeOrderTracker";

import RealtimeActivityFeed from "../components/RealtimeActivityFeed";

import {
  useDashboardRealtime,
} from "../shared/hooks/useDashboardRealtime";

function RealtimeDashboardPage() {

  useDashboardRealtime();

  return (

    <div className="space-y-4 p-4">

      <div className="grid grid-cols-2 gap-4">

        <LiveRevenuePulse />

        <OnlineCustomerWidget />

      </div>

      <LiveLeaderboardWidget />

      <RealtimeOrderTracker />

      <RealtimeActivityFeed />

    </div>

  );

}

export default RealtimeDashboardPage;