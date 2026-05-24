import { motion, AnimatePresence } from "framer-motion";

export default function RankUpCinematic({ show, data, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >

          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

          {/* SPOTLIGHT */}
          <motion.div
            className="absolute w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* CARD */}
          <motion.div
            className="relative bg-gradient-to-b from-yellow-300 to-yellow-600 px-10 py-8 rounded-3xl shadow-[0_0_80px_rgba(255,200,0,0.5)] text-center"
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
          >

            <div className="text-xs tracking-widest opacity-80">
              RANK UP
            </div>

            <div className="text-2xl font-bold mt-2">
              {data?.name}
            </div>

            <div className="text-sm mt-1">
              {data?.score} pts
            </div>

            <div className="mt-4 text-black/70 text-xs">
              You’ve ascended the leaderboard
            </div>

          </motion.div>

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute bottom-10 text-white/60 text-xs"
          >
            TAP TO CONTINUE
          </button>

        </motion.div>
      )}
    </AnimatePresence>
  );
}