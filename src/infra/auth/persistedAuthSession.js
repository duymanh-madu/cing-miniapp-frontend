export function
getPersistedAuthSession() {
  try {
    const rawSession =
      localStorage.getItem(
        "cing_session"
      );

    const session =
      rawSession
        ? JSON.parse(
            rawSession
          )
        : null;

    const accessToken =
      String(
        session?.accessToken ||
        localStorage.getItem(
          "cing_access_token"
        ) ||
        ""
      ).trim() || null;

    const refreshToken =
      String(
        session?.refreshToken ||
        localStorage.getItem(
          "cing_refresh_token"
        ) ||
        ""
      ).trim() || null;

    return {
      session,
      accessToken,
      refreshToken,
    };
  } catch {
    return {
      session: null,
      accessToken: null,
      refreshToken: null,
    };
  }
}

export function
getCanonicalAccessToken() {
  return (
    getPersistedAuthSession()
      .accessToken
  );
}
