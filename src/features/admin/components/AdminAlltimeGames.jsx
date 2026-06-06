import { useState, useEffect } from "react";
import apiClient from "@/infra/api/apiClient";

const DEFAULT_GAMES = {
  "black-pearl-rush":      { enabled:true, display_name:"Bay cùng trân châu", icon:"🫧" },
};

export default function AdminAlltimeGames({ token }) {
  const [cfg, setCfg]   = useState(null);
  const [msg, setMsg]   = useState("");
  const [saving, setSaving] = useState(false);
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiClient.get("/admin/leaderboard/alltime-games-config", { headers:h })
      .then(r => setCfg(r.data?.data || { enabled:true, games:DEFAULT_GAMES }))
      .catch(() => setCfg({ enabled:true, games:DEFAULT_GAMES }));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/admin/leaderboard/alltime-games-config", { config:cfg }, { headers:h });
      setMsg("✅ Đã lưu!"); setTimeout(()=>setMsg(""),3000);
    } catch(e) { setMsg("❌ "+e.message); }
    setSaving(false);
  };

  const toggleGame = (key) => setCfg(p=>({...p, games:{...p.games,
    [key]:{...p.games[key], enabled:!p.games[key].enabled}}}));

  const toggleAll = () => setCfg(p=>({...p, enabled:!p.enabled}));

  const updateReward = (gameKey, idx, field, val) => {
    setCfg(p=>{
      const next = JSON.parse(JSON.stringify(p));
      next.games[gameKey].rewards[idx][field] = field==="points" ? Number(val) : val;
      return next;
    });
  };

  const addGame = () => {
    const key = prompt("Nhập game key (ví dụ: my-new-game):");
    if (!key) return;
    const name = prompt("Tên hiển thị:");
    const icon = prompt("Icon (emoji):", "🎮");
    setCfg(p=>({...p, games:{...p.games,
      [key]:{ enabled:true, display_name:name||key, icon:icon||"🎮",
        rewards:[{rank:1,points:500,label:"🥇 Vô địch"},{rank:2,points:300,label:"🥈 Á quân"},{rank:3,points:200,label:"🥉 Hạng ba"}] }
    }}));
  };

  if (!cfg) return <div style={{color:"Top 888",padding:20}}>Đang tải...</div>;

  return (
    <div style={{padding:"0 0 40px"}}>
      {msg && <div style={{background:msg.startsWith("✅")?"rgba(76,175,80,0.15)":"rgba(244,67,54,0.15)",
        border:`1px solid ${msg.startsWith("✅")?"#4CAF50":"#f44336"}`,borderRadius:10,
        padding:"10px 14px",marginBottom:12,color:msg.startsWith("✅")?"#4CAF50":"#f44336",fontSize:13}}>{msg}</div>}

      {/* Master toggle */}
      <div style={{background:"#1a0d05",borderRadius:12,padding:"14px 16px",marginBottom:16,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        border:`1px solid ${cfg.enabled?"#D4531C44":"Top 333"}`}}>
        <div>
          <p style={{color:"white",fontWeight:800,margin:"0 0 2px",fontSize:14}}>
            🏆 Bảng XH Alltime Games
          </p>
          <p style={{color:"Top 888",fontSize:11,margin:0}}>Hiển thị trong Game Center</p>
        </div>
        <button onClick={toggleAll} style={{
          background:cfg.enabled?"#D4531C":"Top 333",border:"none",color:"white",
          borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {cfg.enabled?"🟢 Bật":"⚫ Tắt"}
        </button>
      </div>

      {/* Game list */}
      {Object.entries(cfg.games||{}).map(([key, game]) => (
        <div key={key} style={{background:"#1a0d05",borderRadius:12,padding:"14px 16px",
          marginBottom:12,border:`1px solid ${game.enabled?"#D4531C33":"Top 222"}`}}>
          {/* Game header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:22}}>{game.icon}</span>
              <div>
                <p style={{color:"white",fontWeight:800,margin:0,fontSize:13}}>{game.display_name}</p>
                <p style={{color:"Top 555",fontSize:10,margin:0}}>{key}</p>
              </div>
            </div>
            <button onClick={()=>toggleGame(key)} style={{
              background:game.enabled?"rgba(212,83,28,0.2)":"#2a2a2a",
              border:`1px solid ${game.enabled?"#D4531C":"Top 333"}`,
              color:game.enabled?"#D4531C":"Top 666",
              borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {game.enabled?"ON":"OFF"}
            </button>
          </div>

          {/* Rewards */}
          {game.enabled && (
            <div>
              <p style={{color:"Top 888",fontSize:10,fontWeight:700,margin:"0 0 8px",letterSpacing:1}}>
                PHẦN THƯỞNG TOP 3
              </p>
              {(game.rewards||[]).map((r,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                  <span style={{fontSize:16,width:24}}>{i===0?"🥇":i===1?"🥈":"🥉"}</span>
                  <input value={r.label} onChange={e=>updateReward(key,i,"label",e.target.value)}
                    style={{flex:2,background:"#0d0604",border:"1px solid #333",color:"white",
                      borderRadius:6,padding:"6px 8px",fontSize:12}}/>
                  <input type="number" value={r.points} onChange={e=>updateReward(key,i,"points",e.target.value)}
                    style={{width:70,background:"#0d0604",border:"1px solid #D4531C44",color:"#D4531C",
                      borderRadius:6,padding:"6px 8px",fontSize:12,fontWeight:700}}/>
                  <span style={{color:"Top 555",fontSize:11}}>điểm</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={addGame} style={{width:"100%",background:"rgba(212,83,28,0.1)",
        border:"1px dashed #D4531C44",color:"#D4531C",borderRadius:10,
        padding:"10px",fontSize:13,cursor:"pointer",marginBottom:16}}>
        + Thêm game mới
      </button>

      <button onClick={save} disabled={saving} style={{width:"100%",background:"#D4531C",
        border:"none",color:"white",borderRadius:10,padding:"13px",
        fontSize:14,fontWeight:900,cursor:"pointer"}}>
        {saving?"Đang lưu...":"💾 Lưu cấu hình"}
      </button>
    </div>
  );
}
