import {
  useAdminRealtime,
} from "../shared/hooks/useAdminRealtime";

import AdminRealtimeAlertPanel from "../components/AdminRealtimeAlertPanel";

import AdminCampaignList from "../components/AdminCampaignList";

import AdminActivityFeed from "../components/AdminActivityFeed";

function AdminOperationsPage() {

  useAdminRealtime();

  return (

    <div
      className="

        space-y-4

        p-4

      "
    >

      <AdminRealtimeAlertPanel />

      <AdminCampaignList />

      <AdminActivityFeed />

    </div>

  );

}

export default AdminOperationsPage;