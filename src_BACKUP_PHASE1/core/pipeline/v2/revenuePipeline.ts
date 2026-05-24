import { paymentFlowGuard } from "../../payment/v2/paymentFlowGuard";
import { crmConsistencyLayer } from "../../crm/v2/crmConsistencyLayer";

class RevenuePipeline {

  handlePayment(paymentId: string, data: any) {

    return paymentFlowGuard.process(paymentId, data, (payload: any) => {

      const customer = payload.customer;

      crmConsistencyLayer.upsert({
        phone: customer.phone,
        lastPayment: payload.amount,
        totalSpend: (customer.totalSpend || 0) + payload.amount,
      });

      return {
        status: "SUCCESS",
        updatedCRM: true,
      };

    });

  }

}

export const revenuePipeline = new RevenuePipeline();
