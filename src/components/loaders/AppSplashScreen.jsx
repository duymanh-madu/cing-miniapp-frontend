import {
  motion,
} from "framer-motion";

/**
 * ============================================
 * APP SPLASH SCREEN
 * ============================================
 */

function AppSplashScreen() {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="
        fixed
        inset-0
        z-[9999]
        flex
        flex-col
        items-center
        justify-center
        bg-[#f7f1e8]
      "
    >
      {/* LOGO */}

      <motion.div
        initial={{
          scale: 0.8,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.6,
        }}
        className="
          flex
          flex-col
          items-center
          gap-5
        "
      >
        <div
          className="
            h-[110px]
            w-[110px]
            rounded-[34px]
            bg-gradient-to-br
            from-brand-orange
            to-orange-400
            shadow-[0_25px_60px_rgba(242,140,40,0.35)]
            flex
            items-center
            justify-center
          "
        >
          <span
            className="
              text-[42px]
            "
          >
            🧋
          </span>
        </div>

        <div
          className="
            text-center
          "
        >
          <h1
            className="
              text-[32px]
              font-black
              text-brand-orange
              tracking-tight
            "
          >
            Cing Hu Tang
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              font-medium
              tracking-wide
            "
          >
            PREMIUM MINI APP
          </p>
        </div>
      </motion.div>

      {/* LOADER */}

      <div
        className="
          absolute
          bottom-[90px]
          left-1/2
          -translate-x-1/2
          flex
          items-center
          gap-2
        "
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
          }}
          className="
            h-3
            w-3
            rounded-full
            bg-brand-orange
          "
        />

        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: 0.15,
          }}
          className="
            h-3
            w-3
            rounded-full
            bg-brand-orange
          "
        />

        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: 0.3,
          }}
          className="
            h-3
            w-3
            rounded-full
            bg-brand-orange
          "
        />
      </div>
    </motion.div>
  );
}

export default AppSplashScreen;