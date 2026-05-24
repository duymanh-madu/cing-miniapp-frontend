class SimpleLogger {

  log(event: string, data?: any) {
    console.log("[LOG]", event, data || "");
  }

  error(event: string, error?: any) {
    console.error("[ERROR]", event, error || "");
  }

}

export const simpleLogger = new SimpleLogger();
