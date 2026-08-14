export function destroyPremiumArtilleryGame(
  game
) {
  if (!game) {
    return;
  }

  game.destroy(true);
}
