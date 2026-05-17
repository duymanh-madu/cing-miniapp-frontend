/**
 * =====================================================
 * REALTIME PERSISTENCE ENGINE
 * =====================================================
 */

const STORAGE_KEY =
  "cing_realtime_state";

export function persistRealtimeState(

  state

) {

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(
      state
    )

  );

}

export function restoreRealtimeState() {

  const raw =
    localStorage.getItem(

      STORAGE_KEY

    );

  if (!raw) {

    return null;

  }

  try {

    return JSON.parse(
      raw
    );

  } catch {

    return null;

  }

}