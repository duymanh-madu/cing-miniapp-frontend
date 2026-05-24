class RetryEngine {

  async execute(fn: Function, retries = 3) {

    let lastError: any;

    for (let i = 0; i < retries; i++) {

      try {
        return await fn();
      } catch (err) {
        lastError = err;
      }

    }

    throw lastError;

  }

}

export const retryEngine = new RetryEngine();
