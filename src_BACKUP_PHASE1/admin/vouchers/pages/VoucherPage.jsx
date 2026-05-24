import {
  useEffect,
} from "react";

import voucherBootstrap from "../voucherBootstrap";

import voucherRealtimeSocket from "../voucherRealtimeSocket";

import useVoucherStore from "../voucherStore";

import VoucherMetricsGrid from "../components/VoucherMetricsGrid";

import VoucherBuilderForm from "../components/VoucherBuilderForm";

function VoucherPage() {

  const metrics =
    useVoucherStore(
      (
        state
      ) => state.voucherMetrics
    );

  useEffect(() => {

    voucherBootstrap
      .bootstrap();

    voucherRealtimeSocket
      .initialize();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Voucher Operating Platform
      </div>

      <VoucherMetricsGrid
        metrics={metrics}
      />

      <VoucherBuilderForm />

    </div>

  );

}

export default
  VoucherPage;