import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const POPUP_KEY = "cing_popup_seen_";

export default function AppPopup() {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    apiClient.get("/app-config/public")
      .then(r => {
        const cfg = r.data?.data;
        if (!cfg?.popup_enabled || !cfg?.popup_title) return;
        // Mỗi popup_title khác nhau chỉ show 1 lần
        const key = POPUP_KEY + btoa(cfg.popup_title).slice(0,16);
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
        setPopup(cfg);
        // Delay nhẹ để tránh flash khi load
        setTimeout(() => setVisible(true), 600);
      })
      .catch(() => {});
  }, []);

  const close = () => {
    setAnimOut(true);
    setTimeout(() => { setVisible(false); setAnimOut(false); }, 300);
  };

  if (!visible || !popup) return null;

  return (
    <div onClick={close} style={{
      position:"fixed", inset:0, zIndex:9000,
      background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"24px",
      animation: animOut ? "fadeOut 0.3s ease forwards" : "fadeIn 0.3s ease forwards",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"linear-gradient(145deg,#1a0805,#0d0402)",
        borderRadius:24, width:"100%", maxWidth:360,
        border:"1px solid rgba(212,83,28,0.3)",
        boxShadow:"0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,83,28,0.1)",
        animation: animOut ? "slideDown 0.3s ease forwards" : "slideUp 0.3s ease forwards",
        overflow:"hidden",
      }}>
        {/* Header decoration */}
        <div style={{ height:4, background:"linear-gradient(90deg,#D4531C,#FF6B35,#FFD700,#FF6B35,#D4531C)" }}/>

        {/* Banner image */}
        {popup.popup_image_url && (
          <div style={{ width:"100%", aspectRatio:"16/9", background:"#0a0402",
            position:"relative", overflow:"hidden" }}>
            {!imgLoaded && (
              <div style={{ position:"absolute", inset:0,
                background:"linear-gradient(135deg,#1a0805,#0d0402)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontSize:32 }}>🧋</div>
              </div>
            )}
            <img src={popup.popup_image_url} alt=""
              onLoad={() => setImgLoaded(true)}
              style={{ width:"100%", height:"100%", objectFit:"cover",
                opacity: imgLoaded ? 1 : 0, transition:"opacity 0.3s ease" }}/>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: popup.popup_image_url ? "16px 24px 20px" : "24px 24px 20px" }}>
          {/* Close button */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
            <button onClick={close} style={{ background:"rgba(255,255,255,0.06)",
              border:"none", color:"rgba(255,255,255,0.5)", borderRadius:8,
              width:28, height:28, cursor:"pointer", fontSize:14,
              display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {/* Icon — ẩn khi có ảnh */}
          {!popup.popup_image_url && (
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:48, lineHeight:1 }}>🧋</div>
            </div>
          )}

          {/* Title */}
          <h2 style={{ color:"#FFD700", fontSize:18, fontWeight:900, margin:"0 0 10px",
            textAlign:"center", textShadow:"0 0 20px rgba(255,215,0,0.4)", lineHeight:1.3 }}>
            {popup.popup_title}
          </h2>

          {/* Content */}
          {popup.popup_content && (
            <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13, lineHeight:1.7,
              margin:"0 0 20px", textAlign:"center" }}>
              {popup.popup_content}
            </p>
          )}

          {/* Button */}
          {popup.popup_button_text && (
            <button onClick={() => {
              if (popup.popup_button_link) window.open(popup.popup_button_link, "_blank");
              close();
            }} style={{
              width:"100%", background:"linear-gradient(135deg,#D4531C,#FF6B35)",
              border:"none", color:"white", borderRadius:14, padding:"14px",
              fontSize:15, fontWeight:900, cursor:"pointer",
              boxShadow:"0 4px 20px rgba(212,83,28,0.4)",
            }}>
              {popup.popup_button_text}
            </button>
          )}

          {/* Skip */}
          <button onClick={close} style={{ width:"100%", background:"none",
            border:"none", color:"rgba(255,255,255,0.3)", fontSize:12,
            cursor:"pointer", marginTop:12, padding:"4px" }}>
            Bỏ qua
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeOut { from{opacity:1} to{opacity:0} }
        @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideDown { from{transform:translateY(0);opacity:1} to{transform:translateY(40px);opacity:0} }
      `}</style>
    </div>
  );
}
