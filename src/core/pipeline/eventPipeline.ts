import { businessRuleEngine } from "../rules/businessRuleEngine";

class EventPipeline {

  process(event: any) {

    switch (event.type) {

      case "ORDER_PAID": {

        const points = businessRuleEngine.calculateLoyaltyPoints(
          event.amount
        );

        return {
          type: "LOYALTY_UPDATED",
          points,
        };
      }

      case "ORDER_CREATED":
        return {
          type: "ORDER_REGISTERED",
          ok: true,
        };

      default:
        return { type: "IGNORED" };
    }
  }

}

export const eventPipeline = new EventPipeline();
