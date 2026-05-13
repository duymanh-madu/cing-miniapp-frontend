import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  FaCloudArrowUp,
} from "react-icons/fa6";

import useApiStatus from "../../hooks/useApiStatus";

/**
 * ============================================
 * GLOBAL NETWORK INDICATOR
 * ============================================
 */

function GlobalNetworkIndicator() {
  const {
    active,
  } = useApiStatus();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
          className="
            fixed
            left-1/2
            top-4
            z-[9999]
            flex
            -translate-x-1/2
            items-center
            gap-2
            rounded-full
            bg-[#2b1800]
            px-4
            py-2
            text-white
            shadow-[0_20px_40px_rgba(0,0,0,0.25)]
          "
        >
          <FaCloudArrowUp
            className="
              text-sm
            "
          />

          <span
            className="
              text-[12px]
              font-bold
            "
          >
            Đồng bộ dữ liệu...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GlobalNetworkIndicator;