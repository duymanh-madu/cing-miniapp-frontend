import {
  motion,
} from "framer-motion";

/**
 * ============================================
 * PAGE LOADER
 * ============================================
 */

function PageLoader() {
  return (
    <div
      className="
        flex
        items-center
        justify-center
        py-16
      "
    >
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 1,
        }}
        className="
          h-12
          w-12
          rounded-full
          border-[4px]
          border-brand-orange/20
          border-t-brand-orange
        "
      />
    </div>
  );
}

export default PageLoader;