import customerLoyaltyRuntime from "./customerLoyaltyRuntime";

import customerVoucherRuntime from "./customerVoucherRuntime";

import dynamicRewardConfigRuntime from "@/cms/runtime/dynamicRewardConfigRuntime";

class CustomerRewardRuntime {

  rewardActivation() {

    const reward =
      dynamicRewardConfigRuntime
        .getActivationReward();

    if (
      !reward
    ) {

      return;

    }

    if (
      reward.points
    ) {

      customerLoyaltyRuntime
        .addPoints(
          reward.points
        );

    }

    if (
      reward.voucher
    ) {

      customerVoucherRuntime
        .issueVoucher(
          reward.voucher
        );

    }

  }

}

const customerRewardRuntime =
  new CustomerRewardRuntime();

export default
  customerRewardRuntime;