import {
  useOrderRealtime,
} from "../shared/hooks/useOrderRealtime";

import PaymentPendingBanner from "../components/PaymentPendingBanner";

import ActiveOrderCard from "../components/ActiveOrderCard";

import OrderHistoryList from "../components/OrderHistoryList";

import RealtimeOrderStatusTimeline from "../components/RealtimeOrderStatusTimeline";

function OrderExperiencePage() {

  useOrderRealtime();

  return (

    <div
      className="

        space-y-4

        p-4

      "
    >

      <PaymentPendingBanner />

      <ActiveOrderCard />

      <RealtimeOrderStatusTimeline />

      <OrderHistoryList />

    </div>

  );

}

export default OrderExperiencePage;