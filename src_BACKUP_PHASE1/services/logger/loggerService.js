import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

class LoggerService {
  info(message, payload = {}) {
    runtimeLogger.info("APP", message, payload);
  }

  warn(message, payload = {}) {
    runtimeLogger.warn("APP", message, payload);
  }

  error(message, payload = {}) {
    runtimeLogger.error("APP", message, payload);
  }

  debug(message, payload = {}) {
    runtimeLogger.info("DEBUG", message, payload);
  }
}

const loggerService =
  new LoggerService();

export default loggerService;
