import {
  useAppStore,
} from "../store/appStore";

export function useCustomerState() {

  return useAppStore(
    (state) => ({

      customer:
        state.customer,

    })
  );

}