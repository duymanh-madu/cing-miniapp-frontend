/**
 * =========================================================
 * RUNTIME CONFIG SERVICE
 * =========================================================
 */

class RuntimeConfigService {
  config = null;

  loaded = false;

  async load() {
    if (this.loaded) {
      return this.config;
    }

    const config = {
      appName:
        import.meta.env.VITE_APP_NAME ||
        "Cing Hu Tang Kinh Bắc",

      apiBaseUrl:
        import.meta.env.VITE_API_BASE_URL ||
        "",

      socketUrl:
        import.meta.env.VITE_SOCKET_URL ||
        "",

      environment:
        import.meta.env.MODE,

      realtimeEnabled: true,

      monitoringEnabled: true,
    };

    this.config = config;

    this.loaded = true;

    return config;
  }

  get() {
    return this.config;
  }
}

const runtimeConfigService =
  new RuntimeConfigService();

export default runtimeConfigService;