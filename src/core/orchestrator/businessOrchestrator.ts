import { crmCanonicalService } from "../crm/crmCanonicalService";
import { orderCoreService } from "../order/orderCoreService";
import { loyaltyEngine } from "../loyalty/loyaltyEngine";

class BusinessOrchestrator {

  handleEvent(event: any) {

    switch (event.event) {

      case "CRM_CUSTOMER_SYNCED":
        return crmCanonicalService.syncCustomer(event);

      case "ORDER_CREATED":
        return orderCoreService.createOrder(event);

      case "ORDER_PAID": {
        const order = orderCoreService.markPaid(event.data.orderId);

        return order;
      }

      case "LOYALTY_POINTS_UPDATED":
        return loyaltyEngine.calculatePoints(event.data.amount);

      default:
        return null;
    }

  }

}

export const businessOrchestrator = new BusinessOrchestrator();
