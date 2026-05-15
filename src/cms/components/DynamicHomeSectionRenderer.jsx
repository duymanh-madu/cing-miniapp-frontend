import CustomerProfileCard from "@/customer/components/CustomerProfileCard";

import CustomerWalletCard from "@/customer/components/CustomerWalletCard";

import CustomerRankCard from "@/customer/components/CustomerRankCard";

import RealtimePointsCard from "@/customer/components/RealtimePointsCard";

import CustomerSpendingCard from "@/customer/components/CustomerSpendingCard";

import CustomerVoucherPreview from "@/customer/components/CustomerVoucherPreview";

import TopSpendingLeaderboard from "@/customer/components/TopSpendingLeaderboard";

const componentRegistry = {

  profile:
    CustomerProfileCard,

  wallet:
    CustomerWalletCard,

  rank:
    CustomerRankCard,

  points:
    RealtimePointsCard,

  spending:
    CustomerSpendingCard,

  vouchers:
    CustomerVoucherPreview,

  leaderboard:
    TopSpendingLeaderboard,

};

function DynamicHomeSectionRenderer({
  sections = [],
}) {

  return (

    <div
      className="
        grid
        gap-5
      "
    >

      {
        sections.map(
          (
            section
          ) => {

            const Component =
              componentRegistry[
                section.component
              ];

            if (
              !Component
            ) {

              return null;

            }

            return (

              <Component
                key={
                  section.id
                }
              />

            );

          }
        )
      }

    </div>

  );

}

export default
  DynamicHomeSectionRenderer;