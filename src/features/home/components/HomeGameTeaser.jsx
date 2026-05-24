import { useNavigate } from "react-router-dom";

export default function HomeGameTeaser() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/game-center")} className="w-full text-left active:scale-[0.98] transition-transform duration-150">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 p-5 text-white shadow-lg">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5 uppercase tracking-wide">🔥 Dang hot</span>
            <h3 className="mt-2 text-xl font-black">Black Pearl Rush</h3>
            <p className="mt-1 text-sm text-white/80">Choi ngay - nhan XP va voucher hom nay</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs bg-white/15 rounded-full px-3 py-1 font-medium">🎁 +500 XP</span>
              <span className="text-xs bg-white/15 rounded-full px-3 py-1 font-medium">🏆 Top 10 voucher</span>
            </div>
          </div>
          <div className="ml-4 flex flex-col items-center gap-1">
            <span className="text-5xl">🎮</span>
            <span className="text-xs font-bold bg-white text-violet-600 rounded-full px-3 py-1">Choi ngay</span>
          </div>
        </div>
      </div>
    </button>
  );
}
