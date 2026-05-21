import {
  useMembershipRealtime,
} from "../shared/hooks/useMembershipRealtime";

import MembershipTierCard from "../components/MembershipTierCard";

import LoyaltyPointsCard from "../components/LoyaltyPointsCard";

import CustomerWalletList from "../components/CustomerWalletList";

import LoyaltyHistoryList from "../components/LoyaltyHistoryList";

function MembershipPage() {

  useMembershipRealtime();

  return (

    <div
      className="

        space-y-4

        p-4

      "
    >

      <MembershipTierCard />

      <LoyaltyPointsCard />

      <CustomerWalletList />

      <LoyaltyHistoryList />

    </div>

  );

}

export default MembershipPage;