import { eventRouter } from "./eventRouter";
import { stateLock } from "./stateLock";
import { paymentGuardDistributed } from "./paymentGuardDistributed";
import { crmDistributed } from "./crmDistributed";

class DistributedOrchestrator {

  handle(event: any) {

    const routed = eventRouter.route(event);

    if (!stateLock.acquire(routed.key)) {
      return { status: "LOCKED_CONCURRENT" };
    }

    // PAYMENT FLOW
    if (event.type === "PAYMENT") {
      return paymentGuardDistributed.safeExecute(
        event.id,
        event.storeId,
        () => event.payload
      );
    }

    // CRM FLOW
    if (event.type === "CRM") {
      return crmDistributed.upsert(
        event.storeId,
        event.payload
      );
    }

    return { status: "IGNORED" };
  }

}

export const distributedOrchestrator = new DistributedOrchestrator();
