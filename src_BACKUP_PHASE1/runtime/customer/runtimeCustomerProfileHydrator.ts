import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  syncRuntimeCrmCustomer,
} from "@/runtime/crm/runtimeCrmSyncOrchestrator";

import {
  useRuntimeCrmSyncStore,
} from "@/runtime/crm/runtimeCrmSyncStore";

import {
  useRuntimeCustomerIdentityStore,
} from "./runtimeCustomerIdentityStore";

let hydrationPromise:
  Promise<RuntimeCustomerProfile> |
  null = null;

export type RuntimeCustomerProfile = {
  customerId: string | null;
  fullName: string | null;
};

function extractCrmCustomer(
  response: any
) {

  return (
    response?.customer ||
    response?.crmCustomer ||
    response?.data?.customer ||
    response?.data?.crmCustomer ||
    response
  );

}

export async function hydrateCustomerProfile():
Promise<RuntimeCustomerProfile> {

  const existingCustomer =
    useRuntimeCrmSyncStore
      .getState()
      .customer;

  if (existingCustomer) {

    runtimeLogger.info(
      "RUNTIME",
      "[CUSTOMER] CRM already hydrated"
    );

    return {
      customerId:
        existingCustomer.customerId,
      fullName:
        existingCustomer.fullName,
    };

  }

  if (hydrationPromise) {

    runtimeLogger.info(
      "RUNTIME",
      "[CUSTOMER] Reusing CRM hydration promise"
    );

    return hydrationPromise;

  }

  hydrationPromise =
    (async () => {

      const identity =
        useRuntimeCustomerIdentityStore
          .getState()
          .identity;

      runtimeLogger.info(
        "RUNTIME",
        "[CUSTOMER] Hydrating CRM customer from backend activation"
      );

      const {
        activateMiniAppUser,
      } =
        await import(
          "@/zalo/activation/activationApi"
        );

      const response =
        await activateMiniAppUser({
          phone:
            identity?.phone || "",
          phoneGranted:
            Boolean(identity?.phoneGranted),
          oaFollowed:
            Boolean(identity?.oaFollowed),
          activated:
            Boolean(identity?.memberActivated),
          source:
            "zalo-miniapp",
        });

      const crmCustomer =
        extractCrmCustomer(
          response
        );

      if (!crmCustomer) {
        throw new Error(
          "[CUSTOMER] Backend activation returned empty CRM customer"
        );
      }

      syncRuntimeCrmCustomer(
        crmCustomer
      );

      runtimeLogger.info(
        "RUNTIME",
        "[CUSTOMER] CRM hydration synced"
      );

      return {
        customerId:
          crmCustomer.customerId ||
          crmCustomer.customer_id ||
          crmCustomer.user_id ||
          null,
        fullName:
          crmCustomer.fullName ||
          crmCustomer.customer_name ||
          crmCustomer.name ||
          null,
      };

    })();

  try {

    return await hydrationPromise;

  } finally {

    hydrationPromise =
      null;

  }

}
