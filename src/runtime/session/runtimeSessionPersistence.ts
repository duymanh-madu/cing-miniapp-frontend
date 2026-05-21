const SESSION_STORAGE_KEY =
  "cing_runtime_session";

export function persistRuntimeSession(
  payload: any
) {

  localStorage.setItem(

    SESSION_STORAGE_KEY,

    JSON.stringify(
      payload
    )

  );

}

export function getPersistedRuntimeSession() {

  const raw =
    localStorage.getItem(
      SESSION_STORAGE_KEY
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