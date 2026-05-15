class SessionHydrator {

  SESSION_KEY =
    "cing_session";

  async restore() {

    try {

      const raw =
        localStorage.getItem(
          this.SESSION_KEY
        );

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);

    } catch (error) {

      console.error(
        "session restore failed",
        error
      );

      return null;

    }

  }

  persist(session) {

    localStorage.setItem(
      this.SESSION_KEY,
      JSON.stringify(session)
    );

  }

  clear() {

    localStorage.removeItem(
      this.SESSION_KEY
    );

  }

}

const sessionHydrator =
  new SessionHydrator();

export default sessionHydrator;