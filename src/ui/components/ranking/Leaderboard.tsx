import React from "react";
import TopRankCard from "./TopRankCard";
import { tokens } from "../../design/tokens";

export default function Leaderboard({ data = [] }: any) {

  return (
    <div style={{
      padding: 16,
      background: tokens.colors.bg,
      minHeight: "100vh"
    }}>

      <h2 style={{ color: "#fff", fontSize: 22 }}>
        🏆 Bảng xếp hạng
      </h2>

      {data.map((u: any, i: number) => {

        const rank = i + 1;

        if (rank <= 3) {
          return (
            <TopRankCard
              key={u.id}
              rank={rank}
              name={u.name}
              points={u.points}
            />
          );
        }

        return (
          <div key={u.id} style={{
            background: tokens.colors.card,
            padding: 14,
            borderRadius: tokens.radius.lg,
            marginBottom: 8,
            color: "#fff",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <span>#{rank} {u.name}</span>
            <span>{u.points}</span>
          </div>
        );
      })}
    </div>
  );
}
