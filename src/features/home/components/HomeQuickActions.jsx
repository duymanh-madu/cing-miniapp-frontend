import { useNavigate } from "react-router-dom";

const ACTIONS = [
  { key: "order",   label: "Dat mon",   icon: "🧋", path: "/menu",        bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600" },
  { key: "voucher", label: "Voucher",    icon: "🎟", path: "/account",     bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-600"   },
  { key: "game",    label: "Mini Game",  icon: "🎮", path: "/game-center", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-600" },
  { key: "loyalty", label: "Tich diem", icon: "⭐", path: "/account",     bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-600"  },
];

export default function HomeQuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-4 gap-3">
      {ACTIONS.map((a) => (
        <button key={a.key} onClick={() => navigate(a.path)}
          className={["flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border", a.border, a.bg, "active:scale-95 transition-transform duration-150"].join(" ")}>
          <span className="text-2xl">{a.icon}</span>
          <span className={["text-xs font-semibold", a.text].join(" ")}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
