export function
getPersistedAuthSession() {
  let storedAccessToken = null;
  let storedRefreshToken = null;

  try {
    storedAccessToken =
      localStorage.getItem(
        "cing_access_token"
      );

    storedRefreshToken =
      localStorage.getItem(
        "cing_refresh_token"
      );
  } catch {
    return {
      session: null,
      accessToken: null,
      refreshToken: null,
    };
  }

  let session = null;

  try {
    const rawSession =
      localStorage.getItem(
        "cing_session"
      );

    session =
      rawSession
        ? JSON.parse(
            rawSession
          )
        : null;
  } catch {
    /*
     * cing_session is a convenience snapshot, not the sole
     * persistence authority for backend credentials.
     *
     * A malformed snapshot must not hide independently
     * persisted access/refresh tokens that can still be
     * validated or recovered by the backend.
     */
    session = null;
  }

  const accessToken =
    String(
      session?.accessToken ||
      storedAccessToken ||
      ""
    ).trim() || null;

  const refreshToken =
    String(
      session?.refreshToken ||
      storedRefreshToken ||
      ""
    ).trim() || null;

  return {
    session,
    accessToken,
    refreshToken,
  };
}

export function
getCanonicalAccessToken() {
  return (
    getPersistedAuthSession()
      .accessToken
  );
}
