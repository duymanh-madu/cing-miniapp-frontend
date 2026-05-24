import { RuntimeFeatureFlag } from "./governanceTypes";

class FeatureFlagEngine {

  private flags = new Map<string, RuntimeFeatureFlag>();

  register(flag: RuntimeFeatureFlag) {
    this.flags.set(flag.key, flag);
  }

  isEnabled(key: string) {
    return this.flags.get(key)?.status === "ENABLED";
  }

  setStatus(key: string, status: RuntimeFeatureFlag["status"]) {
    const flag = this.flags.get(key);
    if (!flag) return;
    flag.status = status;
    this.flags.set(key, flag);
  }

  getAll() {
    return Array.from(this.flags.values());
  }
}

export const featureFlagEngine = new FeatureFlagEngine();
