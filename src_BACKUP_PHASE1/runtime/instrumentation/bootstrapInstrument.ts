import { autoInstrumentRuntime } from "./apiAutoScanner";

import * as session from "@/runtime/session";
import * as crm from "@/runtime/customer";
import * as payment from "@/runtime/payment";

export function bootstrapInstrumentation() {

  autoInstrumentRuntime(session, "SESSION");
  autoInstrumentRuntime(crm, "CRM");
  autoInstrumentRuntime(payment, "PAYMENT");

}
