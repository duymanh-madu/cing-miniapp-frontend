import {
  motion,
} from "framer-motion";

/**
 * =========================================================
 * REALTIME STATUS BADGE
 * =========================================================
 */

function RealtimeStatusBadge() {

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: -6,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      className="
        flex
        items-center
        gap-2
        rounded-full
        bg-[#ecfdf3]
        px-3
        py-1
      "
    >

      <div
        className="
          h-2
          w-2
          rounded-full
          bg-[#22c55e]
        "
      />

      <span
        className="
          text-[11px]
          font-semibold
          text-[#15803d]
        "
      >
        Realtime Online
      </span>

    </motion.div>

  );

}

export default
  RealtimeStatusBadge;