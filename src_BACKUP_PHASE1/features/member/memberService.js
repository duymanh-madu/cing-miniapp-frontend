import memberLevels from "./memberLevels";

/**
 * ============================================
 * RESOLVE MEMBER LEVEL
 * ============================================
 */

export function resolveMemberLevel(
  points = 0
) {
  let current =
    memberLevels[0];

  memberLevels.forEach(
    (level) => {
      if (
        points >= level.min
      ) {
        current = level;
      }
    }
  );

  return current;
}