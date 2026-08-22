export const GAME_RUNTIME_AUTHORITY =
  Object.freeze({
    LEGACY_GENERIC:
      "legacy-generic-v1",

    SELF_MANAGED:
      "self-managed-v1",
  });

export function
isSupportedGameRuntimeAuthority(
  value
) {
  return (
    value ===
      GAME_RUNTIME_AUTHORITY
        .LEGACY_GENERIC ||
    value ===
      GAME_RUNTIME_AUTHORITY
        .SELF_MANAGED
  );
}
