import { NavLink, useLocation } from "react-router-dom";
const NAV = [
  { key:"home",        path:"/",            icon:"🏠", label:"Trang chu" },
  { key:"menu",        path:"/menu",        icon:"🧋", label:"Thuc don"  },
  { key:"game-center", path:"/game-center", icon:"🎮", label:"Game"      },
  { key:"leaderboard", path:"/leaderboard", icon:"👑", label:"Danh Vong" },
  { key:"account",     path:"/account",     icon:"👤", label:"Tai khoan" },
];
export default function BottomNavigation() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {NAV.map(item => {
        const active = item.path==="/" ? location.pathname==="/" : location.pathname.startsWith(item.path);
        return (
          <NavLink key={item.key} to={item.path}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative">
            <span className={["text-xl transition-transform duration-150",
              active?"scale-110":"scale-100 opacity-50"].join(" ")}>{item.icon}</span>
            <span className={["text-[10px] font-semibold",
              active?"text-orange-500":"text-gray-400"].join(" ")}>{item.label}</span>
            {active && <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-orange-400"/>}
          </NavLink>
        );
      })}
    </nav>
  );
}
