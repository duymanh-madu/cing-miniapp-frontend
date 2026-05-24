import { runtimeLogger } from "@/runtime/logger/runtimeLogger";

export async function executeContract(contract: {
  phase: string;
  fn: () => Promise<any> | any;
  critical?: boolean;
}) {
  const { phase, fn, critical } = contract;

  try {
    await fn();
    runtimeLogger.info("RUNTIME", `[${phase}] OK`);
  } catch (error) {
    runtimeLogger.error("RUNTIME", `[${phase}] FAILED`, error);

    if (critical) {
      throw error;
    }
  }
}
