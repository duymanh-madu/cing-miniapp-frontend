import { useState } from "react";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { activateMiniAppUser } from "@/zalo/activation/activationApi";
import { syncRuntimeCrmCustomer } from "@/runtime/crm/runtimeCrmSyncOrchestrator";

export default function ZaloBirthdayGate() {
  const store        = useRuntimeCustomerIdentityStore();
  const identity     = store.identity;
  const status       = store.activationStatus;
  const phoneGranted = store.phoneGranted;
  const oaFollowed   = store.oaFollowed;
  const [dob, setDob]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const shouldShow = status === "blocked" && phoneGranted && oaFollowed;
  if (!shouldShow) return null;

  const validate = () => {
    if (!dob) { setError("Vui lòng nhập ngày sinh"); return false; }
    const d = new Date(dob);
    if (isNaN(d.getTime())) { setError("Ngày sinh không hợp lệ"); return false; }
    const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (age < 10 || age > 100) { setError("Ngày sinh không hợp lệ"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      store.setActivationStatus("checking");
      const result = await activateMiniAppUser({
        phone:        identity?.phone      || "",
        phoneGranted: true,
        oaFollowed:   true,
        activated:    true,
        source:       "zalo-miniapp",
        zaloUserId:   identity?.zaloUserId || "",
        name:         identity?.fullName   || "",
        avatar:       identity?.avatar     || "",
        birthday:     dob,
      });
      syncRuntimeCrmCustomer(result);
      store.setIdentity({ memberActivated: true, phoneGranted: true, oaFollowed: true });
      store.setProfileHydrated(true);
      store.setActivationStatus("activated");
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra, vui lòng thử lại");
      store.setActivationStatus("blocked");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:9999, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:"24px 24px 0 0", padding:"28px 24px 48px", width:"100%", maxWidth:480, boxSizing:"border-box" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:52, marginBottom:8 }}>🎂</div>
          <h2 style={{ fontSize:20, fontWeight:900, color:"#1a1a1a", margin:"0 0 8px" }}>Một bước nữa thôi!</h2>
          <p style={{ fontSize:14, color:"#666", lineHeight:1.6, margin:0 }}>
            Nhập ngày sinh để hoàn tất kích hoạt thành viên
          </p>
        </div>
        <label style={{ display:"block", fontSize:13, color:"#888", marginBottom:4 }}>Ngày sinh</label>
        <input type="date" value={dob}
          onChange={e => { setDob(e.target.value); setError(""); }}
          max={new Date().toISOString().split("T")[0]}
          style={{ width:"100%", padding:"13px 14px", border:"1.5px solid #e0e0e0", borderRadius:12, fontSize:15, boxSizing:"border-box", outline:"none" }}
        />
        {error && <p style={{ fontSize:13, color:"#e53935", marginTop:6 }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width:"100%", padding:"14px", background:loading?"#ccc":"#D4531C", color:"white", border:"none", borderRadius:14, fontSize:16, fontWeight:800, cursor:loading?"not-allowed":"pointer", marginTop:16 }}>
          {loading ? "Đang kích hoạt..." : "Kích hoạt thành viên"}
        </button>
      </div>
    </div>
  );
}
