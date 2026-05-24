import { useMemo } from "react";
import { motion } from "framer-motion";
import useLeaderboardStore from "@/features/leaderboard/store/leaderboardStore";

/**
 * =====================================================
 * 🏆 LEADERBOARD — COMPACT LUXURY PODIUM v2 (FIX FIXED)
 * =====================================================
 * FIX ONLY:
 * - raise podium higher
 * - reduce unnecessary vertical spacing
 * - keep all UI/UX intact
 * =====================================================
 */

export default function LeaderboardPage() {
  const entries = useLeaderboardStore((s) => s.entries);

  const data = useMemo(() => {
    const fallback = [
      { name: "Duy Mạnh", score: 3200 },
      { name: "Sơn Tùng-MTP", score: 2800 },
      { name: "J97", score: 2500 },
      { name: "Đạt G", score: 1800 },
      { name: "Trấn Thành", score: 1200 },
      { name: "Trường Giang", score: 1100 },
    ];

    return entries?.length ? entries : fallback;
  }, [entries]);

  const top1 = data[0];
  const top2 = data[1];
  const top3 = data[2];
  const rest = data.slice(3);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* HEADER (unchanged) */}
      <div className="text-center pt-5 pb-1">
        <h1 className="text-2xl md:text-3xl font-black tracking-[0.4em]">
          LEADERBOARD
        </h1>
        <p className="text-[11px] text-white/40 mt-1">
          Bảng xếp hạng danh giá
        </p>
      </div>

      {/* ===================== PODIUM AREA (FIXED POSITION) ===================== */}
      <div className="flex justify-center items-end gap-3 mt-2 px-3 -translate-y-2">

        {/* #2 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <span className="text-[10px] text-white/50 mb-1">#2</span>

          <div className="w-20 h-24 md:w-24 md:h-28 rounded-2xl bg-gradient-to-b from-gray-200 to-gray-600 shadow-lg flex items-center justify-center">
            <div className="text-black text-center px-1">
              <div className="text-[11px] font-bold truncate">
                {top2?.name}
              </div>
              <div className="text-[10px] opacity-80">{top2?.score}</div>
            </div>
          </div>
        </motion.div>

        {/* #1 */}
        <motion.div
          initial={{ y: 30, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="flex flex-col items-center z-10"
        >
          <span className="text-[10px] text-yellow-300 font-bold mb-1">
            👑 CHAMPION
          </span>

          <div className="w-24 h-32 md:w-28 md:h-36 rounded-2xl bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 shadow-[0_0_60px_rgba(255,215,0,0.35)] flex items-center justify-center">
            <div className="text-black text-center px-2">
              <div className="text-[12px] font-black truncate">
                {top1?.name}
              </div>
              <div className="text-[11px]">{top1?.score}</div>
            </div>
          </div>

          <div className="w-14 h-1 bg-yellow-400/20 blur-md mt-1 rounded-full" />
        </motion.div>

        {/* #3 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <span className="text-[10px] text-white/50 mb-1">#3</span>

          <div className="w-20 h-24 md:w-24 md:h-28 rounded-2xl bg-gradient-to-b from-orange-300 to-orange-800 shadow-lg flex items-center justify-center">
            <div className="text-center px-1">
              <div className="text-[11px] font-bold truncate">
                {top3?.name}
              </div>
              <div className="text-[10px] opacity-80">{top3?.score}</div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ===================== LIST ===================== */}
      <div className="mt-3 px-3 pb-24 space-y-2">

        {rest.map((u, i) => (
          <div
            key={i}
            className="
              flex justify-between items-center
              px-4 py-3
              rounded-xl
              bg-white/5
              border border-white/10
            "
          >
            <div className="text-white/70 text-sm">
              #{i + 4} {u.name}
            </div>

            <div className="text-yellow-300 font-bold text-sm">
              {u.score}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}