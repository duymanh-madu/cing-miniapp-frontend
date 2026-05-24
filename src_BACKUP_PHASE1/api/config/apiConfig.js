import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

export const API_CONFIG = {

  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "/api",

  TIMEOUT:
    15000,

};

runtimeLogger.info(
  "API",
  "[CONFIG] API config loaded",
  {
    baseURL:
      API_CONFIG.BASE_URL,
  }
);

export default API_CONFIG;
