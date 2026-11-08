import {currentCustomerIdentityV42,currentCustomerPhoneV42} from '@/infra/auth/currentCustomerIdentityV42.js';
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
  const authenticated=useAuthStore(s=>s.authenticated);
  const accessToken=useAuthStore(s=>s.accessToken);
  const profile=useAuthStore(s=>s.profile);
  const owner=currentCustomerIdentityV42({authenticated,accessToken,profile});
  const developerOverride=import.meta.env.DEV===true?currentCustomerPhoneV42(overridePhone):'';
  const phone=developerOverride||owner.phone;
  const ownerId=developerOverride?'development-only':owner.id;
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
        ownerId,
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

        return (
          response.data?.success === true && currentCustomerPhoneV42(response.data?.data?.phone) === phone
            ? response.data.data
            : null
        );
      },

      enabled:
        !!phone,

      refetchOnWindowFocus: true,

      staleTime:
        60 * 1000,

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
