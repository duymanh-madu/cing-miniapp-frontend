import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import V8RoyalGameLeaderboardView from "@/features/leaderboard/components/royal/V8RoyalGameLeaderboardView";

const MEDAL = ["🥇","🥈","🥉"];

function getPhone() {
  const sources = [
    useRuntimeCustomerIdentityStore.getState().identity?.phone,
    useAuthStore.getState().profile?.phone,
  ];
  for (const src of sources) {
    if (!src || src === "pending") continue;
    const n = src.replace(/\D/g, "").replace(/^84/, "0");
    if (n.length >= 9) return n;
  }
  return "";
}

const GAME_NAMES = {
  "black-pearl-rush": "Bay cùng trân châu 🫧",
  "cing-stack-tower": "Xếp Tháp Cing 🧱",
  "chess": "Kỳ thủ cờ vua ♟️",

  "cing-block-puzzle": "Cing Block Puzzle",
};

const GAME_ICONS = {
  "black-pearl-rush": "/game-icons/black-pearl-rush.svg",
  "cing-stack-tower": "/game-icons/cing-stack-tower.svg",
  "cing-block-puzzle": "/game-icons/cing-block-puzzle.png",
};

export default function GameLeaderboard({ gameKey, onClose }) {
  const [data,        setData]        = useState([]);
  const [myRank,      setMyRank]      = useState(null);
  const [rewards,     setRewards]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [animatedIds, setAnimatedIds] = useState(() => new Set());

  const prevRanksRef   = useRef(new Map());
  const animationTimer = useRef(null);

  const profileId   = useAuthStore(s => s.profile?.id);
  const navigate    = useNavigate();
  const goProfile   = (uid) => { if (uid) { onClose(); setTimeout(() => navigate(`/profile/${uid}`), 150); } };

  const updateMyRankFromRows = (rows = []) => {
    const phone = getPhone();
    const rankId = phone || profileId;
    if (!rankId) return;

    const idx = rows.findIndex(r => String(r.user_id) === String(rankId));
    if (idx >= 0) {
      setMyRank({
        rank: idx + 1,
        total: rows.length,
        score: rows[idx]?.score ?? rows[idx]?.value ?? 0,
      });
    }
  };

  const rememberRanks = (rows = []) => {
    prevRanksRef.current = new Map(
      rows.map((row, index) => [String(row.user_id), index + 1])
    );
  };

  const applyRealtimeRows = (rows = [], updatedUserId = "") => {
    const prevRanks = prevRanksRef.current || new Map();
    const hotIds = new Set();

    rows.forEach((row, index) => {
      const id = String(row.user_id);
      const nextRank = index + 1;
      const prevRank = prevRanks.get(id);

      if (prevRank && prevRank !== nextRank) hotIds.add(id);
      if (updatedUserId && id === String(updatedUserId)) hotIds.add(id);
    });

    setData(rows);
    updateMyRankFromRows(rows);
    rememberRanks(rows);

    if (hotIds.size > 0) {
      setAnimatedIds(hotIds);
      if (animationTimer.current) clearTimeout(animationTimer.current);
      animationTimer.current = setTimeout(() => {
        setAnimatedIds(new Set());
      }, 1800);
    }
  };

  const fetchData = async ({ background=false } = {}) => {
    if (!background) {
      setLoading(true);
    }
    try {
      const r = await apiClient.get(`/leaderboard/top-games/${gameKey}`);
      const rows = r.data?.data || [];
      setLoadError(false);
      setData(rows);
      rememberRanks(rows);
      updateMyRankFromRows(rows);

      if (r.data?.rewards?.length) setRewards(r.data.rewards);

      const phone = getPhone();
      const rankId = phone || profileId;
      if (rankId) {
        apiClient.get(`/leaderboard/user-game-rank/${rankId}/${gameKey}`)
          .then(r2 => setMyRank(r2.data?.data)).catch(() => {});
      }
    } catch (e) {
      console.warn(
        "[GameLeaderboard] leaderboard fetch failed",
        {
          gameKey,
          background,
          message: e?.message,
          status: e?.response?.status,
        }
      );

      setLoadError(true);
    }
    finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();

    const handleRealtimeLeaderboard = (payload) => {
      if (payload?.type && payload.type !== "game") return;
      if (payload?.game_key && payload.game_key !== gameKey) return;
      if (payload?.scope && payload.scope !== "weekly") return;
      if (!Array.isArray(payload?.leaderboard)) return;

      applyRealtimeRows(
        payload.leaderboard,
        payload?.updated_user?.user_id
      );
    };

    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.off("leaderboard.updated", handleRealtimeLeaderboard);
        socket.on("leaderboard.updated", handleRealtimeLeaderboard);
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };

    attach();

    const onVisible = () => {
      if (
        document.visibilityState === "visible"
      ) {
        fetchData({
          background:true,
        });
      }
    };

    document.addEventListener(
      "visibilitychange",
      onVisible
    );

    return () => {
      if (animationTimer.current) clearTimeout(animationTimer.current);
      getRuntimeSocket()?.off("leaderboard.updated", handleRealtimeLeaderboard);
      document.removeEventListener(
        "visibilitychange",
        onVisible
      );
    };
  }, [gameKey, profileId]);

  const phone = getPhone();
  const publicTop10 = data.slice(0, 10);
  const top3  = publicTop10.slice(0, 3);
  const rest  = publicTop10.slice(3);

  return (
    <V8RoyalGameLeaderboardView
      gameTitle={GAME_NAMES[gameKey] || gameKey}
      gameIcon={GAME_ICONS[gameKey] || ""}
      rewards={rewards}
      loading={loading}
      loadError={loadError}
      onRetry={() => fetchData()}
      data={publicTop10}
      top3={top3}
      rest={rest}
      myRank={myRank}
      phone={phone}
      animatedIds={animatedIds}
      onClose={onClose}
      onProfile={goProfile}
    />
  );
}
