import { useNavigate } from "react-router-dom";

const TIERS = {
  bronze:  { label: "Dong",      color: "from-amber-600 to-yellow-500", icon: "🥉" },
  silver:  { label: "Bac",       color: "from-slate-400 to-gray-300",   icon: "🥈" },
  gold:    { label: "Vang",      color: "from-yellow-400 to-amber-300", icon: "🥇" },
  diamond: { label: "Kim Cuong", color: "from-cyan-400 to-blue-500",    icon: "💎" },
};

export default function HomeMembershipCard() {
  const navigate = useNavigate();
  const tier = "gold";
  const points = 1250;
  const next = 2000;
  const pct = Math.round((points / next) * 100);
  const cfg = TIERS[tier];
  return (
    <button onClick={() => navigate("/account")} className="w-full text-left active:scale-[0.98] transition-transform duration-150">
      <div className={["relative overflow-hidden rounded-3xl bg-gradient-to-r p-5 text-white shadow-md", cfg.color].join(" ")}>
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cfg.icon}</span>
              <div>
                <p className="text-xs text-white/75 font-medium">Thanh vien</p>
                <p className="text-base font-black">{cfg.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/75">Diem tich luy</p>
              <p className="text-xl font-black">{points.toLocaleString("vi")}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{points.toLocaleString("vi")} diem</span>
              <span>Con {(next - points).toLocaleString("vi")} diem len hang tiep</span>
            </div>
            <div className="h-2 rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{"width": "${pct}%"}} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
