import { useNavigate } from "react-router-dom";
export default function HomeGameTeaser() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/game-center")} className="w-full text-left active:scale-[0.98] transition-transform duration-150">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 p-5 text-white shadow-lg">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black tracking-widest bg-white/20 px-2 py-0.5 rounded-full">🔥 ĐANG HOT</span>
            </div>
            <h3 className="text-lg font-black mb-1">Bay cùng trân châu</h3>
            <p className="text-sm text-white/70 mb-3">Chơi ngay - Leo rank và nhận vô vàn phần thưởng</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">🏆 Vinh danh top 100 gamer</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 ml-4 shrink-0">
            <span className="text-4xl">🎮</span>
            <span className="text-xs font-black bg-white text-purple-600 px-3 py-1 rounded-full">Chơi ngay</span>
          </div>
        </div>
      </div>
    </button>
  );
}
