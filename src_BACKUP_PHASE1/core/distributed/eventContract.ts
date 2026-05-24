export type SystemEvent =
  | "ORDER_CREATED"
  | "PAYMENT_SUCCESS"
  | "CRM_UPDATED"
  | "LOYALTY_UPDATED"
  | "STORE_SYNC";

export interface BaseEvent {
  id: string;
  type: SystemEvent;
  storeId: string;
  timestamp: number;
  payload: any;
}
