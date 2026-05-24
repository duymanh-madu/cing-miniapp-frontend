import { eventPipeline } from "../pipeline/eventPipeline";
import { paymentReliability } from "../payment/paymentReliability";
import { crmSyncCore } from "../crm/crmSyncCore";

class BusinessPipeline {

  execute(event: any) {

    // 1. PAYMENT SAFETY FIRST
    if (event.type === "PAYMENT") {
      return paymentReliability.processPayment(
        event.paymentId,
        event
      );
    }

    // 2. CRM SYNC
    if (event.type === "CRM_SYNC") {
      return crmSyncCore.sync(event.data);
    }

    // 3. BUSINESS EVENTS
    return eventPipeline.process(event);
  }

}

export const businessPipeline = new BusinessPipeline();
