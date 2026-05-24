import { lazy } from "react";

const gameModules = {

  "black-pearl-rush":
    lazy(() =>
      import(
        "../../games/black-pearl-rush"
      )
    ),

};

export default function GameLoader({
  gameId,
}) {

  const Component =
    gameModules[gameId];

  if (!Component) {

    return (
      <div>
        Game Not Found
      </div>
    );

  }

  return <Component />;

}