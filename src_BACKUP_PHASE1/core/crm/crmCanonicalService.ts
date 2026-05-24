import { BusinessEventPayload } from "../contracts/businessEvents";

class CrmCanonicalService {

  private customerCache = new Map<string, any>();

  syncCustomer(payload: BusinessEventPayload) {

    const customer = payload.data;

    this.customerCache.set(customer.phone, {
      ...customer,
      lastSync: Date.now(),
    });

    return this.customerCache.get(customer.phone);
  }

  getCustomer(phone: string) {
    return this.customerCache.get(phone);
  }

}

export const crmCanonicalService = new CrmCanonicalService();
