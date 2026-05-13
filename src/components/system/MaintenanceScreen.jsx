import {
  motion,
} from "framer-motion";

/**
 * ============================================
 * MAINTENANCE SCREEN
 * ============================================
 */

function MaintenanceScreen() {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="
        fixed
        inset-0
        z-[99999]
        flex
        flex-col
        items-center
        justify-center
        bg-[#f7f1e8]
        px-6
        text-center
      "
    >
      <div
        className="
          flex
          h-[120px]
          w-[120px]
          items-center
          justify-center
          rounded-[36px]
          bg-gradient-to-br
          from-brand-orange
          to-orange-400
          text-[58px]
          shadow-[0_30px_70px_rgba(242,140,40,0.35)]
        "
      >
        🛠️
      </div>

      <h1
        className="
          mt-8
          text-[34px]
          font-black
          tracking-tight
          text-[#2b1800]
        "
      >
        Hệ thống bảo trì
      </h1>

      <p
        className="
          mt-4
          max-w-[340px]
          text-[15px]
          leading-relaxed
          text-gray-500
        "
      >
        Mini App đang được nâng cấp để
        mang tới trải nghiệm tốt hơn.
      </p>

      <div
        className="
          mt-8
          rounded-full
          bg-white
          px-5
          py-3
          text-sm
          font-bold
          text-brand-orange
          shadow-[0_12px_30px_rgba(0,0,0,0.06)]
        "
      >
        Realtime Maintenance Mode
      </div>
    </motion.div>
  );
}

export default MaintenanceScreen;