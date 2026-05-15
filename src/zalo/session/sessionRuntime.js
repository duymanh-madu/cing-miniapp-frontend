class SessionRuntime {

  SESSION_KEY =
    "cing_zalo_session";

  save(payload) {

    localStorage.setItem(
      this.SESSION_KEY,
      JSON.stringify(payload)
    );

  }

  restore() {

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

  clear() {

    localStorage.removeItem(
      this.SESSION_KEY
    );

  }

}

const sessionRuntime =
  new SessionRuntime();

export default sessionRuntime;