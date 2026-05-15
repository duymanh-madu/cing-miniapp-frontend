/**
 * =========================================================
 * LOGGER SERVICE
 * =========================================================
 */

class LoggerService {
  info(message, payload = {}) {
    console.log(
      `[INFO] ${message}`,
      payload
    );
  }

  warn(message, payload = {}) {
    console.warn(
      `[WARN] ${message}`,
      payload
    );
  }

  error(message, payload = {}) {
    console.error(
      `[ERROR] ${message}`,
      payload
    );
  }

  debug(message, payload = {}) {
    if (
      import.meta.env.DEV
    ) {
      console.debug(
        `[DEBUG] ${message}`,
        payload
      );
    }
  }
}

const loggerService =
  new LoggerService();

export default loggerService;