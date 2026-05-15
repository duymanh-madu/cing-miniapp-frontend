import {
  useEffect,
} from "react";

import GameCanvas from "@/game/components/GameCanvas";

import GameLeaderboard from "@/game/components/GameLeaderboard";

import MyGameRankCard from "@/game/components/MyGameRankCard";

import gameRealtimeRuntime from "@/game/runtime/gameRealtimeRuntime";

function GamePage() {

  useEffect(() => {

    gameRealtimeRuntime
      .initialize();

  }, []);

  return (

    <div
      className="
        min-h-screen
        bg-black
        p-5
        text-white
      "
    >

      <div
        className="
          mb-6
          text-4xl
          font-black
        "
      >
        Cing Bird
      </div>

      <div
        className="
          mb-5
        "
      >

        <MyGameRankCard />

      </div>

      <div
        className="
          mb-6
        "
      >

        <GameCanvas />

      </div>

      <GameLeaderboard />

    </div>

  );

}

export default
  GamePage;