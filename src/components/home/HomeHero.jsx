import { FaBell } from "react-icons/fa6";
import RealtimeStatusBadge from "../header/RealtimeStatusBadge";
import useAuthStore from "@/stores/auth/authStore";
import useRealtimeCustomerStore from "@/stores/customer/customerRuntimeStore";

function HomeHero() {
  const authProfile = useAuthStore((s) => s.profile);
  const customerProfile = useRealtimeCustomerStore((s) => s.profile);
  const displayName = authProfile?.name || authProfile?.displayName || customerProfile?.name || "Ban oi";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  return (
    <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#f28c28] via-orange-400 to-orange-500 p-6 text-white shadow-[0_25px_60px_rgba(242,140,40,0.35)]">
      <div className="absolute -right-10 -top-10 h-[180px] w-[180px] rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 h-[120px] w-[120px] rounded-full bg-white/10" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{greeting}</p>
            <h1 className="mt-1 text-[30px] font-black leading-tight">{displayName}</h1>
          </div>
          <button className="h-[52px] w-[52px] rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center border border-white/20 active:scale-95 transition-transform">
            <FaBell className="text-xl" />
          </button>
        </div>
        <div className="mt-4"><RealtimeStatusBadge /></div>
        <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-white/85">
          Thưởng thức trà sữa premium, nhận voucher realtime và tham gia mini game mỗi ngày.
        </p>
      </div>
    </section>
  );
}
export default HomeHero;
