import realtimeGameStore from "@/games/store/gameRuntimeStore";

function GameObstacleLayer() {

  const obstacles =
    realtimeGameStore(
      (state) =>
        state.obstacles
    );

  return (

    <>

      {
        obstacles.map(
          (
            obstacle
          ) => (

            <div
              key={
                obstacle.id
              }
            >

              <div
                className="
                  absolute
                  w-[70px]
                  bg-green-500
                "
                style={{

                  left:
                    obstacle.x,

                  top:
                    0,

                  height:
                    obstacle.gapY,

                }}
              />

              <div
                className="
                  absolute
                  w-[70px]
                  bg-green-500
                "
                style={{

                  left:
                    obstacle.x,

                  top:
                    obstacle.gapY +
                    obstacle.gapHeight,

                  bottom:
                    0,

                }}
              />

            </div>

          )
        )
      }

    </>

  );

}

export default
  GameObstacleLayer;