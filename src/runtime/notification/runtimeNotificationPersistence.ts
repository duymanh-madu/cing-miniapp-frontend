const NOTIFICATION_STORAGE_KEY =
  "cing_runtime_notifications";

export function persistNotifications(
  payload: any
) {

  localStorage.setItem(

    NOTIFICATION_STORAGE_KEY,

    JSON.stringify(
      payload
    )

  );

}

export function getPersistedNotifications() {

  const raw =
    localStorage.getItem(
      NOTIFICATION_STORAGE_KEY
    );

  if (!raw) {

    return [];
  }

  try {

    return JSON.parse(
      raw
    );

  } catch {

    return [];
  }

}