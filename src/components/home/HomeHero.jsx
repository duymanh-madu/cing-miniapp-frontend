import NotificationBell from "@/features/notification/components/NotificationBell";
import RealtimeStatusBadge from "../header/RealtimeStatusBadge";
import useAuthStore from "@/stores/auth/authStore";
import useRealtimeCustomerStore from "@/stores/customer/customerRuntimeStore";

const IS_ZALO = typeof window !== "undefined" && (window.__ZALO_MINI_APP__ || navigator.userAgent.includes("ZaloApp"));
const TEST_PROFILE = {
  id: "0984966336",
  phone: "0984966336",
  name: "Duy Mạnh",
  displayName: "Duy Mạnh",
  avatar: null,
};

function HomeHero() {
  const authProfile = useAuthStore((s) => s.profile);
  const customerProfile = useRealtimeCustomerStore((s) => s.profile);
  const displayName = authProfile?.name || authProfile?.displayName || customerProfile?.name || "Khách";
  const setSession = useAuthStore(s => s.setSession);
  const authenticated = useAuthStore(s => s.authenticated);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const handleTestLogin = () => {
    setSession({ accessToken: "test-token", refreshToken: null, profile: TEST_PROFILE });
    sessionStorage.setItem("dev_membership_phone", TEST_PROFILE.phone);
  };
  const handleTestLogout = () => {
    useAuthStore.getState().clearSession();
    sessionStorage.removeItem("dev_membership_phone");
  };

  return (
    <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#f28c28] via-orange-400 to-orange-500 p-6 text-white shadow-[0_25px_60px_rgba(242,140,40,0.35)]">
      <div className="absolute -right-10 -top-10 h-[180px] w-[180px] rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 h-[120px] w-[120px] rounded-full bg-white/10" />
      <div className="relative z-10" style={{ display:"flex", flexDirection:"column", minHeight:160 }}>
        {/* Top row: logo + bell */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:0 }}>
          <img src="/logo-cing.png" alt="Cing Hu Tang Kinh Bac"
            style={{ height:54, objectFit:"contain", filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.25))" }} />
          <NotificationBell />
        </div>
        {/* Greeting centered - chinh giua card */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
          <p className="text-sm font-medium text-white/80">{greeting}</p>
          <h1 className="mt-1 text-[28px] font-black leading-tight">{displayName}</h1>
        </div>
        <div><RealtimeStatusBadge /></div>
      </div>
    </section>
  );
}
export default HomeHero;
