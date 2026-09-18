import {
  useQuery,
} from "@tanstack/react-query";

import apiClient
  from "@/infra/api/apiClient";

import useAuthStore
  from "@/stores/auth/authStore";

import {
  useMembershipStore,
} from "@/membership/store/membershipStore";

const MEMBERSHIP_SNAPSHOT_PREFIX =
  "cing_membership_snapshot_v1:";

function readMembershipSnapshot(phone) {
  if (!phone) return null;

  try {
    const raw =
      localStorage.getItem(
        MEMBERSHIP_SNAPSHOT_PREFIX + phone
      );

    if (!raw) return null;

    const parsed =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.data ||
      typeof parsed.data !== "object"
    ) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function persistMembershipSnapshot(
  phone,
  data
) {
  if (
    !phone ||
    !data ||
    typeof data !== "object"
  ) {
    return;
  }

  try {
    localStorage.setItem(
      MEMBERSHIP_SNAPSHOT_PREFIX + phone,
      JSON.stringify({
        version: 1,
        savedAt:
          Date.now(),
        data,
      })
    );
  } catch {}
}

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

export function useMembership(
  overridePhone = ""
) {
  const profile =
    useAuthStore(
      state =>
        state.profile
    );

  const storePhone =
    normalizePhone(
      profile?.phone ||
      profile?.phoneNumber ||
      profile?.mobile ||
      ""
    );

  const phone =
    normalizePhone(
      overridePhone ||
      storePhone ||
      ""
    );

  const realtimePoints =
    useMembershipStore(
      state =>
        state.loyaltyPoints
    );

  const realtimePointsPhone =
    normalizePhone(
      useMembershipStore(
        state =>
          state.loyaltyPointsPhone
      )
    );

  const query =
    useQuery({
      queryKey: [
        "membership",
        phone,
      ],

      queryFn: async ({
        signal,
      }) => {

        if (!phone) {
          return null;
        }

        const response =
          await apiClient.get(
            `/membership/${phone}`,
            {
              signal,
            }
          );

        const data =
          response.data?.data ||
          null;

        if (data) {
          persistMembershipSnapshot(
            phone,
            data
          );
        }

        return data;
      },

      enabled:
        !!phone,

      initialData:
        () =>
          readMembershipSnapshot(
            phone
          ),

      initialDataUpdatedAt:
        () => 0,

      staleTime:
        5 * 60 * 1000,

      gcTime:
        10 * 60 * 1000,

      retry:
        2,
    });

  const hasRealtimePoints =
    !!phone &&
    realtimePointsPhone ===
      phone &&
    Number.isFinite(
      Number(
        realtimePoints
      )
    );

  const data =
    query.data &&
    typeof query.data ===
      "object" &&
    hasRealtimePoints
      ? {
          ...query.data,

          points:
            Number(
              realtimePoints
            ),
        }
      : query.data;

  return {
    ...query,
    data,
  };
}
