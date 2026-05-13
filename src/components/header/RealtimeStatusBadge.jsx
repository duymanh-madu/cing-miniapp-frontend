import {
  motion,
} from "framer-motion";

import useRealtimeStatus from "../../hooks/useRealtimeStatus";

/**
 * ============================================
 * REALTIME STATUS BADGE
 * ============================================
 */

function RealtimeStatusBadge() {
  const {
    socketConnected,
    reconnecting,
  } =
    useRealtimeStatus();

  /**
   * STATUS
   */

  let label =
    "Offline";

  let color =
    "bg-red-500";

  if (
    reconnecting
  ) {
    label =
      "Reconnecting";

    color =
      "bg-yellow-500";
  }

  if (
    socketConnected &&
    !reconnecting
  ) {
    label =
      "Realtime Online";

    color =
      "bg-green-500";
  }

  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        bg-white/90
        backdrop-blur-xl
        px-4
        py-2
        shadow-[0_8px_20px_rgba(0,0,0,0.06)]
      "
    >
      <motion.div
        animate={{
          scale: [
            1,
            1.25,
            1,
          ],
        }}
        transition={{
          repeat:
            Infinity,

          duration: 1.2,
        }}
        className={`
          h-3
          w-3
          rounded-full
          ${color}
        `}
      />

      <span
        className="
          text-[12px]
          font-bold
          text-gray-700
        "
      >
        {label}
      </span>
    </div>
  );
}

export default RealtimeStatusBadge;