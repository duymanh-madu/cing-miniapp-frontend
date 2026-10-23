import {useLiveEffect} from "@/runtime/live/useLiveEffect";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { getGame } from "@/games/registry/gameRegistry";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import V8RoyalAlltimeView from "@/features/leaderboard/components/royal/V8RoyalAlltimeView";

export default function AlltimeLeaderboard({ onClose }) {
  const [games,      setGames]      = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [myRank,     setMyRank]     = useState(null);
  const boardsEpoch=useRef(0), rankEpoch=useRef(0);
  const profile      = useAuthStore(s => s.profile);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const navigate     = useNavigate();

  const myId = (() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return profile?.id || "";
  })();

  const goProfile = (uid) => {
    if (uid) { onClose(); setTimeout(() => navigate(`/profile/${uid}`), 150); }
  };

  const fetchBoards = useCallback(async ({ background = false } = {}) => {
    const epoch=++boardsEpoch.current;
    if (!background) setLoading(true);

    try {
      const r = await apiClient.get("/game/leaderboard/alltime-games");
      if(epoch!==boardsEpoch.current)return;
      const next = r.data?.data || [];

      setGames(next);

      setActiveGame(current => {
        if (
          current &&
          next.some(game => game.game_key === current)
        ) {
          return current;
        }

        return next[0]?.game_key || null;
      });
    } catch {
      if (!background && epoch===boardsEpoch.current) setGames([]);
    } finally {
      if (epoch===boardsEpoch.current) setLoading(false);
    }
  }, []);

  const fetchPrivateRank = useCallback(
    async gameKey => {
      const epoch=++rankEpoch.current;
      if (!gameKey || !myId) {
        setMyRank(null);
        return;
      }

      try {
        const r = await apiClient.get(
          `/game/leaderboard/alltime-user-rank/${myId}/${gameKey}`
        );

        if(epoch===rankEpoch.current)setMyRank(r.data?.data || null);
      } catch {
        if(epoch===rankEpoch.current)setMyRank(null);
      }
    },
    [myId]
  );

  useLiveEffect(({background}) => { void fetchBoards({background}); return () => {boardsEpoch.current++;}; }, [fetchBoards], ["leaderboard","profile"]);

  useLiveEffect(() => { void fetchPrivateRank(activeGame); return () => {rankEpoch.current++;}; }, [activeGame, fetchPrivateRank], ["leaderboard","profile"]);


  const currentGame = games.find(g => g.game_key === activeGame);
  const publicRows = (currentGame?.data || []).slice(0, 10);
  const top3 = publicRows.slice(0, 3);
  const rest = publicRows.slice(3);
  const myEntry = publicRows.find(
    e => String(e.user_id) === String(myId)
  );
  const privateOutsideTop10 =
    Boolean(myRank?.rank) &&
    Number(myRank.rank) > 10;
  const scoreLabel = currentGame?.score_label || "điểm";

  return (
    <V8RoyalAlltimeView
      games={games}
      activeGame={activeGame}
      onSelectGame={setActiveGame}
      onClose={onClose}
      onProfile={goProfile}
      loading={loading}
      currentGame={currentGame}
      publicRows={publicRows}
      myRank={myRank}
      privateOutsideTop10={privateOutsideTop10}
      scoreLabel={scoreLabel}
      myId={myId}
    />
  );
}
