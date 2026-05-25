import { useState } from "react";

export default function AdminLogin({ auth }) {
  const [u, setU] = useState("admin");
  const [p, setP] = useState("");

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f13",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#1a1a24", borderRadius:20, padding:"40px 36px",
        width:340, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <p style={{ color:"#D4531C", fontSize:11, fontWeight:800,
            letterSpacing:3, margin:"0 0 8px" }}>CING HU TANG</p>
          <h1 style={{ color:"white", fontSize:22, fontWeight:900, margin:0 }}>
            Admin Panel
          </h1>
        </div>
        {auth.error && (
          <div style={{ background:"rgba(255,80,80,0.1)", border:"1px solid rgba(255,80,80,0.3)",
            borderRadius:10, padding:"10px 14px", marginBottom:16,
            color:"#ff6b6b", fontSize:13 }}>{auth.error}</div>
        )}
        <input placeholder="Tên đăng nhập" value={u} onChange={e=>setU(e.target.value)}
          style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
            borderRadius:10, padding:"11px 14px", color:"white", fontSize:14,
            outline:"none", marginBottom:10, boxSizing:"border-box" }}/>
        <input type="password" placeholder="Mật khẩu" value={p}
          onChange={e=>setP(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&auth.login(u,p)}
          style={{ width:"100%", background:"#2a2a38", border:"1px solid #333",
            borderRadius:10, padding:"11px 14px", color:"white", fontSize:14,
            outline:"none", marginBottom:20, boxSizing:"border-box" }}/>
        <button onClick={()=>auth.login(u,p)} disabled={auth.loading}
          style={{ width:"100%", background:"linear-gradient(135deg,#D4531C,#ff6b35)",
            color:"white", border:"none", borderRadius:10, padding:"12px",
            fontSize:15, fontWeight:800, cursor:"pointer" }}>
          {auth.loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </div>
    </div>
  );
}
