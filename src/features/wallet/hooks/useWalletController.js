import useWalletOverview
  from "./useWalletOverview";

import useWalletTopup
  from "./useWalletTopup";


export default function useWalletController() {
  const overview =
    useWalletOverview();

  const topup =
    useWalletTopup({
      transactions:
        overview.transactions,

      refreshOverview:
        overview.refresh,
    });

  return {
    ...overview,
    topup,
  };
}
