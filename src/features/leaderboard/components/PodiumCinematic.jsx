import { motion } from "framer-motion";

export default function PodiumCinematic({ top1, top2, top3 }) {
  return (
    <div className="flex justify-center items-end h-[320px] gap-4 relative">

      {/* LIGHT BEAM */}
      <div className="absolute inset-0 flex justify-center">
        <div className="w-[2px] h-full bg-yellow-400/20 blur-sm" />
      </div>

      {/* #2 */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-24 h-28 bg-gradient-to-b from-gray-200 to-gray-600 rounded-2xl flex flex-col items-center justify-center shadow-xl"
      >
        <div className="text-xs">Top 2</div>
        <div className="font-bold">{top2?.name}</div>
        <div className="text-xs">{top2?.score}</div>
      </motion.div>

      {/* #1 */}
      <motion.div
        initial={{ y: 120, opacity: 0, scale: 0.8 }}
        animate={{ y: -20, opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="w-28 h-36 bg-gradient-to-b from-yellow-300 to-yellow-700 rounded-3xl shadow-[0_0_80px_rgba(255,200,0,0.4)] flex flex-col items-center justify-center"
      >
        <div className="text-xs text-yellow-100">Top 1</div>
        <div className="font-bold text-white">{top1?.name}</div>
        <div className="text-xs text-white/80">{top1?.score}</div>
      </motion.div>

      {/* #3 */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-24 h-24 bg-gradient-to-b from-orange-300 to-orange-700 rounded-2xl flex flex-col items-center justify-center shadow-xl"
      >
        <div className="text-xs">Top 3</div>
        <div className="font-bold">{top3?.name}</div>
        <div className="text-xs">{top3?.score}</div>
      </motion.div>

    </div>
  );
}