class ContractExtractor {

  extract(eventName: string, payload: any) {

    return {
      event: eventName,
      fields: this.flatten(payload),
      timestamp: Date.now(),
    };

  }

  flatten(obj: any, prefix = "", res: any = {}) {

    if (!obj) return res;

    Object.keys(obj).forEach(key => {

      const path = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === "object" && obj[key] !== null) {
        this.flatten(obj[key], path, res);
      } else {
        res[path] = obj[key];
      }

    });

    return res;

  }

}

export const contractExtractor = new ContractExtractor();
