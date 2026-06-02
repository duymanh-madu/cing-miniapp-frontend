import { useMembershipStore } from "@/membership/store/membershipStore";
import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {

  dispatchRuntimeNotification,
} from "../notification/runtimeNotificationOrchestrator";

export const realtimeEventHandlers = {

  "payment.success":
    (
      payload: any
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[EVENT] payment.success",
        payload
      );

      dispatchRuntimeNotification({

        title:
          "Thanh toán thành công",

        message:
          "Đơn hàng của bạn đã được thanh toán.",

      });

    },

  "order.created":
    (
      payload: any
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[EVENT] order.created",
        payload
      );

    },

  "loyalty.updated":
    (
      payload: any
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[EVENT] loyalty.updated",
        payload
      );

      dispatchRuntimeNotification({

        title:
          "Điểm thưởng cập nhật",

        message:
          "Điểm loyalty của bạn vừa thay đổi.",

      });

    },

  "notification.broadcast":
    (
      payload: any
    ) => {

      runtimeLogger.info("RUNTIME",
        "[EVENT] notification.broadcast",
        payload
      );

      dispatchRuntimeNotification({

        title:
          payload?.notification?.title ||
          payload?.title ||
          "🏆 Thông báo",

        message:
          payload?.notification?.message ||
          payload?.message ||
          "",

      });

    },

  "notification.created":
    (
      payload: any
    ) => {

      runtimeLogger.info("RUNTIME", 
        "[EVENT] notification.created",
        payload
      );

      dispatchRuntimeNotification({

        title:
          payload?.title ||
          "Thông báo mới",

        message:
          payload?.message ||
          "Bạn có thông báo mới.",

      });

    },

  "membership.points": (payload: any) => {
    runtimeLogger.info("RUNTIME", "[EVENT] membership.points", payload);
    if (payload?.points !== undefined) useMembershipStore.getState().setLoyaltyPoints(payload.points);
    dispatchRuntimeNotification({ title: "Điểm thưởng cập nhật", message: `Bạn có ${payload?.points ?? ""} điểm.` });
  },

  "membership.updated": (payload: any) => {
    runtimeLogger.info("RUNTIME", "[EVENT] membership.updated", payload);
    if (payload?.tier) useMembershipStore.getState().setMembershipTier(payload.tier);
    if (payload?.points !== undefined) useMembershipStore.getState().setLoyaltyPoints(payload.points);
  },

};