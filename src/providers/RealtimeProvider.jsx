import {
  useEffect,
} from "react";

import {
  initializeSocket,
} from "@/services/socket/socketManager";

import {
  initializeVisibilityRecovery,
} from "@/realtime/services/realtimeVisibilityRecovery";

import {
  initializeCustomerRealtimeBridge,
} from "@/customer/services/customerRealtimeBridge";

/**
 * =====================================================
 * REALTIME PROVIDER
 * =====================================================
 */

function RealtimeProvider({

  children,

}) {

  useEffect(
    () => {

      /**
       * ============================================
       * SOCKET
       * ============================================
       */

      initializeSocket();

      /**
       * ============================================
       * VISIBILITY RECOVERY
       * ============================================
       */

      initializeVisibilityRecovery();

      /**
       * ============================================
       * CUSTOMER REALTIME HYDRATION
       * ============================================
       */

      initializeCustomerRealtimeBridge();

    },
    []
  );

  return children;

}

export default
  RealtimeProvider;