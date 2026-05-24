import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  FaCloudArrowUp,
} from "react-icons/fa6";

import useApiStatus from "@/shared/hooks/useApiStatus";

import useSocketStore from "@/stores/socketStore";

/**
 * =========================================================
 * GLOBAL NETWORK INDICATOR
 * =========================================================
 */

function GlobalNetworkIndicator() {

  /**
   * =======================================================
   * API STATUS
   * =======================================================
   */

  const {
    active,
  } = useApiStatus();

  /**
   * =======================================================
   * SOCKET STATUS
   * =======================================================
   */

  const reconnecting =
    useSocketStore(
      (state) =>
        state.reconnecting
    );

  const offline =
    useSocketStore(
      (state) =>
        state.offline
    );

  /**
   * =======================================================
   * HIDE WHEN OFFLINE
   * =======================================================
   */

  if (offline) {
    return null;
  }

  /**
   * =======================================================
   * ACTIVE STATE
   * =======================================================
   */

  const visible =
    active ||
    reconnecting;

  /**
   * =======================================================
   * LABEL
   * =======================================================
   */

  const label =
    reconnecting
      ? "Đang khôi phục realtime..."
      : "Đồng bộ dữ liệu...";

  return (

    <AnimatePresence>

      {visible && (

        <motion.div
          initial={{
            opacity: 0,
            y: -12,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -12,
            scale: 0.95,
          }}
          transition={{
            duration: 0.2,
          }}
          className="
            fixed
            left-1/2
            top-4
            z-[9999]
            flex
            items-center
            gap-2
            rounded-full
            bg-[#2b1800]
            px-4
            py-2
            text-white
            shadow-[0_20px_40px_rgba(0,0,0,0.25)]
            backdrop-blur-md
            -translate-x-1/2
          "
        >

          <FaCloudArrowUp
            className="
              text-sm
              shrink-0
            "
          />

          <span
            className="
              text-[12px]
              font-bold
              whitespace-nowrap
            "
          >
            {label}
          </span>

        </motion.div>

      )}

    </AnimatePresence>

  );

}

export default
GlobalNetworkIndicator;