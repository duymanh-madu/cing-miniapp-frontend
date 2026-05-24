import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

import {
  destroySession,
} from "./authSession";

import {
  resetQueryCache,
} from "@/query";

export function logout() {

  destroySession();

  resetQueryCache();

  runtimeLogger.info("AUTH", 
    "🔴 LOGGED OUT"
  );

}