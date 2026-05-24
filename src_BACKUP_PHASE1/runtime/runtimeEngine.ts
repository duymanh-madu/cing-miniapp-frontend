export interface RuntimeContract {
  phase: string;
  fn: () => Promise<any> | any;
  critical?: boolean;
  retry?: number;
  dependsOn?: string[];
}

export class RuntimeEngine {
  private registry = new Map<string, RuntimeContract>();

  register(contract: RuntimeContract) {
    this.registry.set(contract.phase, contract);
  }

  async execute(contract: RuntimeContract) {
    const { phase, fn, retry = 0, critical } = contract;

    let attempt = 0;

    while (attempt <= retry) {
      try {
        await fn();
        return;
      } catch (err) {
        attempt++;
        if (attempt > retry && critical) throw err;
      }
    }
  }

  async run() {
    const executed = new Set<string>();

    const runContract = async (c: RuntimeContract) => {
      if (executed.has(c.phase)) return;

      if (c.dependsOn?.length) {
        for (const d of c.dependsOn) {
          const dep = this.registry.get(d);
          if (dep) await runContract(dep);
        }
      }

      await this.execute(c);
      executed.add(c.phase);
    };

    for (const c of this.registry.values()) {
      await runContract(c);
    }
  }
}

export const runtimeEngine = new RuntimeEngine();
