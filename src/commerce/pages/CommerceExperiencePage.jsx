import {
  useCommerceRealtime,
} from "../shared/hooks/useCommerceRealtime";

import OrderConfidenceBanner from "../components/OrderConfidenceBanner";

import LoyaltyProgressCard from "../components/LoyaltyProgressCard";

import VoucherWalletCard from "../components/VoucherWalletCard";

import OrderTimelineCard from "../components/OrderTimelineCard";

function CommerceExperiencePage() {

  useCommerceRealtime();

  return (

    <div
      className="

        space-y-4

        p-4

      "
    >

      <OrderConfidenceBanner />

      <LoyaltyProgressCard />

      <VoucherWalletCard />

      <OrderTimelineCard />

    </div>

  );

}

export default CommerceExperiencePage;