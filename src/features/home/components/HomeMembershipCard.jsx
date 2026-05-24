import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/auth/authStore";
import useRealtimeCustomerStore from "@/stores/customer/customerRuntimeStore";
import { useMembershipProfile } from "@/features/loyalty/hooks/useMembershipProfile";

const TIER_CONFIG = {
  bronze:   { label: "Dong",      color: "from-amber-700 to-yellow-600", icon: "Bronze", next: "Bac"      },
  silver:   { label: "Bac",       color: "from-slate-400 to-gray-300",   icon: "Silver", next: "Vang"     },
  gold:     { label: "Vang",      color: "from-yellow-500 to-amber-400", icon: "Gold",   next: "Bach Kim" },
  platinum: { label: "Bach Kim",  color: "from-cyan-500 to-teal-400",    icon: "Plat",   next: "Kim Cuong"},
  diamond:  { label: "Kim Cuong", color: "from-blue-500 to-indigo-600",  icon: "Diam",   next: null       },
};

const TIER_EMOJI = { bronze:"medal", silver:"medal", gold:"medal", platinum:"gem", diamond:"gem" };

export default function HomeMembershipCard() {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.profile?.id || s.profile?.userId);
  const realtimePoints = useRealtimeCustomerStore((s) => s.profile?.points ?? null);
  const realtimeTier = useRealtimeCustomerStore((s) => s.profile?.tier?.toLowerCase?.() ?? null);
  const { membership, isLoading } = useMembershipProfile(userId);

  const level = realtimeTier || membership?.level || "bronze";
  const points = realtimePoints ?? membership?.points ?? 0;
  const pointsToNext = membership?.pointsToNextLevel ?? 0;
  const progressPct = membership?.progressionPercent ??
    (pointsToNext > 0 ? Math.min(Math.round((points / (points + pointsToNext)) * 100), 99) : 100);
  const cfg = TIER_CONFIG[level] || TIER_CONFIG.bronze;

  if (isLoading && realtimePoints === null) {
    return <div className="w-full h-[120px] rounded-3xl bg-gray-100 animate-pulse" />;
  }

  return (
    <button onClick={() => navigate("/account")} className="w-full text-left active:scale-[0.98] transition-transform duration-150">
      <div className={"relative overflow-hidden rounded-3xl bg-gradient-to-r p-5 text-white shadow-md " + cfg.color}>
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-white/75 font-medium">Thanh vien</p>
                <p className="text-base font-black">{cfg.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/75">Diem tich luy</p>
              <p className="text-xl font-black">{points.toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1.5">
              <span>{points.toLocaleString("vi-VN")} diem</span>
              {cfg.next && pointsToNext > 0
                ? <span>Con {pointsToNext.toLocaleString("vi-VN")} diem len {cfg.next}</span>
                : <span>Hang cao nhat</span>}
            </div>
            <div className="h-2 rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white transition-all duration-700" style={{width: progressPct + "%"}} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
