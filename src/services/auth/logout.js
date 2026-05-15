import {
  destroySession,
} from "./authSession";

import {
  resetQueryCache,
} from "@/query";

export function logout() {

  destroySession();

  resetQueryCache();

  console.log(
    "🔴 LOGGED OUT"
  );

}