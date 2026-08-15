import queryClient
  from "./queryClient";

import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  useMembershipStore,
} from "@/membership/store/membershipStore";

import useAuthStore
  from "@/stores/auth/authStore";

import {
  useRuntimeCustomerIdentityStore,
} from "@/runtime/customer/runtimeCustomerIdentityStore";

function normalizePhone(
  value
) {
  const digits =
    String(
      value || ""
    ).replace(
      /\D/g,
      ""
    );

  if (!digits) {
    return "";
  }

  if (
    digits.startsWith("84")
  ) {
    return (
      "0" +
      digits.slice(2)
    );
  }

  return digits;
}

function getCurrentRuntimePhone() {
  const runtimePhone =
    useRuntimeCustomerIdentityStore
      .getState()
      .identity
      ?.phone;

  const profile =
    useAuthStore
      .getState()
      .profile;

  return normalizePhone(
    runtimePhone ||
    profile?.phone ||
    profile?.phoneNumber ||
    profile?.mobile ||
    ""
  );
}

function getPayloadPhone(
  payload
) {
  return normalizePhone(
    payload?.phone ||
    payload?.user_id ||
    payload?.userId ||
    ""
  );
}

function isMembershipQueryForPhone(
  query,
  phone
) {
  const key =
    query?.queryKey;

  return (
    Array.isArray(key) &&
    key[0] === "membership" &&
    normalizePhone(
      key[1]
    ) === phone
  );
}

class QueryRealtimeSync {

  initialized =
    false;

  register() {

    if (
      this.initialized
    ) {
      return;
    }

    this.initialized =
      true;

    runtimeLogger.info(
      "APP",
      "[QUERY REALTIME] REGISTERED"
    );

  }

  applyMembershipPoints(
    payload
  ) {
    const phone =
      getPayloadPhone(
        payload
      );

    const points =
      Number(
        payload?.points
      );

    if (
      !phone ||
      !Number.isFinite(
        points
      )
    ) {
      return false;
    }

    const currentPhone =
      getCurrentRuntimePhone();

    /*
     * membership.points is currently transported through
     * the shared realtime bus.
     *
     * Never allow another customer's broadcast event to
     * mutate the current customer's presentation state.
     */
    const belongsToCurrentUser =
      !!currentPhone &&
      currentPhone === phone;

    /*
     * membership.points is transported through the shared
     * realtime bus.
     *
     * Reject foreign-customer events before any local
     * query/store/UI mutation.
     */
    if (
      !belongsToCurrentUser
    ) {
      return false;
    }

    /*
     * Do not cancel the HTTP membership snapshot.
     *
     * The HTTP result still owns tier/spending/order metadata.
     * Realtime points are maintained as an identity-bound
     * overlay, preventing an older HTTP points value from
     * replacing a newer committed realtime value.
     */
    let queryUpdated =
      false;

    const queries =
      queryClient.getQueriesData({
        queryKey: [
          "membership",
        ],
      });

    for (
      const [
        queryKey,
        current,
      ] of queries
    ) {
      const keyPhone =
        normalizePhone(
          queryKey?.[1]
        );

      if (
        keyPhone !== phone
      ) {
        continue;
      }

      if (
        !current ||
        typeof current !==
          "object"
      ) {
        continue;
      }

      queryClient.setQueryData(
        queryKey,
        {
          ...current,
          points,
        }
      );

      queryUpdated =
        true;
    }

    useMembershipStore
      .getState()
      .setLoyaltyPoints(
        points,
        phone
      );

    return true;
  }

  applyMembershipUpdated(
    payload
  ) {
    const phone =
      getPayloadPhone(
        payload
      );

    if (!phone) {
      return false;
    }

    const currentPhone =
      getCurrentRuntimePhone();

    const belongsToCurrentUser =
      !!currentPhone &&
      currentPhone === phone;

    if (
      !belongsToCurrentUser
    ) {
      return false;
    }

    if (
      payload?.points !==
      undefined
    ) {
      this.applyMembershipPoints(
        payload
      );
    }

    const tier =
      payload?.tier ||
      payload?.tierKey ||
      "";

    if (!tier) {
      return belongsToCurrentUser;
    }

    const queries =
      queryClient.getQueriesData({
        queryKey: [
          "membership",
        ],
      });

    for (
      const [
        queryKey,
        current,
      ] of queries
    ) {
      if (
        normalizePhone(
          queryKey?.[1]
        ) !== phone
      ) {
        continue;
      }

      if (
        !current ||
        typeof current !==
          "object"
      ) {
        continue;
      }

      queryClient.setQueryData(
        queryKey,
        {
          ...current,
          tierKey:
            tier,
        }
      );
    }

    if (
      belongsToCurrentUser
    ) {
      useMembershipStore
        .getState()
        .setMembershipTier(
          tier
        );
    }

    return true;
  }

}

const queryRealtimeSync =
  new QueryRealtimeSync();

export {
  normalizePhone as normalizeMembershipPhone,
};

export default
  queryRealtimeSync;
