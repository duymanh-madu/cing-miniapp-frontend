import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  restoreSession,
} from "../services/authSessionService";

export function bootstrapAuthLayer() {

  restoreSession();

  runtimeLogger.info("AUTH", 
    "🔐 Auth layer booted"
  );

}