const BADGE_META = {
  member:        { label:"Hội viên",            mark:"◆" },
  loyal:         { label:"Hội viên Thân Thiết", mark:"◆" },
  silver:        { label:"Hội viên Bạc",        mark:"◆" },
  gold:          { label:"Hội viên Vàng",       mark:"◆" },
  diamond:       { label:"Hội viên Kim Cương",  mark:"◆" },
  partner:       { label:"Đối Tác",             mark:"◇" },
  loyal_partner: { label:"Đối Tác Thân Thiết",  mark:"◇" },
  champion:      { label:"Kiện tướng",          mark:"♛" },
  hof_1:         { label:"Vương Giả",           mark:"Ⅰ" },
  hof_2:         { label:"Phú Hào",             mark:"Ⅱ" },
  hof_3:         { label:"Địa Chủ",              mark:"Ⅲ" },
  idol:          { label:"Idol",                 mark:"✦" },
  ngoi_sao:      { label:"Ngôi sao",             mark:"★" },
  minh_tinh:     { label:"Minh tinh",            mark:"✧" },
};

const DISPLAY_ORDER = [
  "hof_1",
  "hof_2",
  "hof_3",
  "champion",
  "minh_tinh",
  "ngoi_sao",
  "idol",
  "loyal_partner",
  "partner",
  "diamond",
  "gold",
  "silver",
  "loyal",
  "member",
];

export default function LeaderboardBadgeChips({
  entry,
  align = "center",
}) {
  const owned = Array.isArray(entry?.owned_badges)
    ? entry.owned_badges
    : [];

  const keys = DISPLAY_ORDER.filter(
    key => owned.includes(key) && BADGE_META[key]
  );

  if (!keys.length) return null;

  return (
    <span
      aria-label="Danh hiệu đang sở hữu"
      style={{
        display:"flex",
        flexWrap:"wrap",
        justifyContent:
          align === "start"
            ? "flex-start"
            : "center",
        gap:4,
        marginTop:5,
        width:"100%",
        maxWidth:"100%",
      }}
    >
      {keys.map(key => (
        <span
          key={key}
          style={{
            display:"inline-flex",
            alignItems:"center",
            gap:4,
            minHeight:18,
            padding:"2px 7px",
            borderRadius:999,
            border:"1px solid rgba(232,201,139,.22)",
            background:"linear-gradient(180deg,rgba(232,201,139,.10),rgba(255,255,255,.025))",
            color:"#E8C98B",
            fontSize:9,
            lineHeight:1.25,
            fontWeight:800,
            letterSpacing:.15,
            whiteSpace:"nowrap",
            boxShadow:"inset 0 1px rgba(255,255,255,.03)",
          }}
        >
          <span aria-hidden="true">{BADGE_META[key].mark}</span>
          {BADGE_META[key].label}
        </span>
      ))}
    </span>
  );
}
