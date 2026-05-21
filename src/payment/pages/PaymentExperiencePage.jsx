import {
  usePaymentRealtime,
} from "../shared/hooks/usePaymentRealtime";

import PaymentStatusCard from "../components/PaymentStatusCard";

import PaymentRecoveryBanner from "../components/PaymentRecoveryBanner";

import PaymentRetryButton from "../components/PaymentRetryButton";

function PaymentExperiencePage() {

  usePaymentRealtime();

  return (

    <div
      className="

        space-y-4

        p-4

      "
    >

      <PaymentStatusCard />

      <PaymentRecoveryBanner />

      <PaymentRetryButton />

    </div>

  );

}

export default PaymentExperiencePage;