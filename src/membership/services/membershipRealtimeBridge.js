import {
  useMembershipStore,
} from "../store/membershipStore";

export function connectMembershipRealtime({
  socket,
}) {

  socket.on(
    "membership.points",
    (payload) => {

      useMembershipStore
        .getState()
        .setLoyaltyPoints(
          payload.points,
          payload.phone ||
          payload.user_id ||
          payload.userId ||
          ""
        );

    }
  );

  socket.on(
    "membership.tier",
    (payload) => {

      useMembershipStore
        .getState()
        .setMembershipTier(
          payload.tier
        );

    }
  );

}