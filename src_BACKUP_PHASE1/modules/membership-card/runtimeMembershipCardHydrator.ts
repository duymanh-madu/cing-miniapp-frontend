import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  getRuntimeCrmCustomer,
} from "@/runtime/crm/runtimeCrmSelectors";

/**
 * =====================================================
 * MEMBERSHIP CARD HYDRATOR
 * =====================================================
 * Production governance:
 * - No demo/fake membership card data.
 * - iPOS CRM is the source of truth.
 * - Runtime card hydrates only from normalized CRM customer.
 * =====================================================
 */

export async function hydrateMembershipCard() {

  runtimeLogger.info("APP", 
    "[CARD] Hydrating membership card from CRM runtime"
  );

  const customer =
    getRuntimeCrmCustomer();

  if (!customer) {

    return {

      customerId:
        null,

      tier:
        null,

      totalSpent:
        0,

      loyaltyPoints:
        0,

      pendingActivation:
        true,

    };

  }

  return {

    customerId:
      customer.customerId ||
      null,

    tier:
      customer.memberTier ||
      customer.membershipType ||
      null,

    totalSpent:
      Number(
        customer.totalSpent ||
        customer.membershipPaymentAmount ||
        0
      ),

    loyaltyPoints:
      Number(
        customer.loyaltyPoints ||
        customer.membershipPoint ||
        0
      ),

    pendingActivation:
      false,

  };

}