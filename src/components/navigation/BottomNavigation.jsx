import { NavLink, useLocation } from "react-router-dom";

const NAV = [
  { key:"home",        path:"/",            icon:"🏠", label:"Trang chủ" },
  { key:"menu",        path:"/menu",        icon:"🧋", label:"Thực đơn"  },
  { key:"game-center", path:"/game-center", icon:"🎮", label:"Game"      },
  { key:"leaderboard", path:"/leaderboard", icon:"👑", label:"Đại sảnh danh vọng"    },
  { key:"account",     path:"/account",     icon:"👤", label:"Tài khoản" },
];

export default function BottomNavigation() {
  const location = useLocation();
  return (
    <nav style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:50,
      display:"flex", background:"white",
      borderTop:"1px solid #f0f0f0",
      boxShadow:"0 -4px 20px rgba(0,0,0,0.06)",
    }}>
      {NAV.map(item => {
        const active = item.path==="/"
          ? location.pathname==="/"
          : location.pathname.startsWith(item.path);
        return (
          <NavLink key={item.key} to={item.path} style={{
            flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            padding:"8px 2px 6px", textDecoration:"none",
            position:"relative",
          }}>
            <span style={{
              fontSize:22,
              transform: active ? "scale(1.15)" : "scale(1)",
              opacity: active ? 1 : 0.45,
              transition:"all 0.15s",
            }}>{item.icon}</span>
            <span style={{
              fontSize:9, fontWeight:700, marginTop:3,
              color: active ? "#D4531C" : "#9ca3af",
              textAlign:"center", lineHeight:1.2,
            }}>{item.label}</span>
            {active && (
              <span style={{
                position:"absolute", bottom:0,
                width:28, height:2.5, borderRadius:2,
                background:"#D4531C",
              }}/>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
