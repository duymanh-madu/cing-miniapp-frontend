class SessionRuntime {
  getJwt() {
    return localStorage.getItem(
      "miniapp_jwt"
    );
  }

  hasSession() {
    return !!this.getJwt();
  }

  clear() {
    localStorage.removeItem(
      "miniapp_jwt"
    );
  }
}

const sessionRuntime =
  new SessionRuntime();

export default sessionRuntime;