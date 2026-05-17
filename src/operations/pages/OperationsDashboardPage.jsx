import {
  useOperationsRealtime,
} from "../hooks/useOperationsRealtime";

import OperationsLiveOrders from "../components/OperationsLiveOrders";

import KitchenQueueWidget from "../components/KitchenQueueWidget";

import DeliveryQueueWidget from "../components/DeliveryQueueWidget";

import OperationsAlertPanel from "../components/OperationsAlertPanel";

function OperationsDashboardPage() {

  useOperationsRealtime();

  return (

    <div className="space-y-4 p-4">

      <OperationsLiveOrders />

      <div className="grid grid-cols-1 gap-4">

        <KitchenQueueWidget />

        <DeliveryQueueWidget />

      </div>

      <OperationsAlertPanel />

    </div>

  );

}

export default OperationsDashboardPage;