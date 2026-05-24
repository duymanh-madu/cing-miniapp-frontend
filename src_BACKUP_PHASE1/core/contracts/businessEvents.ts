export type BusinessEvent =
  | "CRM_CUSTOMER_SYNCED"
  | "ORDER_CREATED"
  | "ORDER_PAID"
  | "LOYALTY_POINTS_UPDATED"
  | "MEMBER_TIER_CHANGED"
  | "PAYMENT_RECONCILED";

export interface BusinessEventPayload<T = any> {
  event: BusinessEvent;
  data: T;
  timestamp: number;
  source: "ipos" | "miniapp" | "system";
}
