import React from "react";
import { tokens } from "../../design/tokens";

export default function TopRankCard({ rank, name, points }: any) {

  const styleMap: any = {
    1: { color: tokens.colors.gold, shadow: tokens.shadow.glowGold, emoji: "👑" },
    2: { color: tokens.colors.silver, shadow: tokens.shadow.glowSilver, emoji: "🥈" },
    3: { color: tokens.colors.bronze, shadow: tokens.shadow.glowBronze, emoji: "🥉" }
  };

  const s = styleMap[rank];

  return (
    <div style={{
      background: tokens.colors.card,
      padding: 18,
      borderRadius: tokens.radius.xl,
      marginBottom: 12,
      boxShadow: s.shadow,
      border: `1px solid ${s.color}`
    }}>
      <div style={{ fontSize: 18 }}>
        {s.emoji} TOP {rank}
      </div>

      <div style={{ fontSize: 20, marginTop: 6 }}>
        {name}
      </div>

      <div style={{ color: tokens.colors.muted }}>
        {points} points
      </div>
    </div>
  );
}
