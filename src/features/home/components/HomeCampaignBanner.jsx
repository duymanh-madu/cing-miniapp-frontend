import { useState } from "react";

const BANNERS = [
  { id: "1", title: "Mua 1 tang 1",  subtitle: "Tra sua premium moi thu 3",     bg: "from-orange-400 to-rose-400",   emoji: "🧋" },
  { id: "2", title: "Tich diem x2",  subtitle: "Cuoi tuan nay - chi qua Zalo",  bg: "from-violet-400 to-indigo-500", emoji: "⭐" },
  { id: "3", title: "Free ship",      subtitle: "Don tu 79k trong ban kinh 3km", bg: "from-teal-400 to-cyan-500",     emoji: "🛵" },
];

export default function HomeCampaignBanner() {
  const [active, setActive] = useState(0);
  const b = BANNERS[active];
  return (
    <div className="px-4">
      <div className={["relative overflow-hidden rounded-3xl bg-gradient-to-r p-5 text-white shadow-lg", b.bg].join(" ")}>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/75 uppercase tracking-wider">Uu dai hom nay</p>
            <h3 className="mt-1 text-2xl font-black">{b.title}</h3>
            <p className="mt-1 text-sm text-white/85">{b.subtitle}</p>
          </div>
          <span className="text-5xl">{b.emoji}</span>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-3">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={["h-2 rounded-full transition-all duration-300", i === active ? "w-6 bg-orange-400" : "w-2 bg-gray-200"].join(" ")} />
        ))}
      </div>
    </div>
  );
}
