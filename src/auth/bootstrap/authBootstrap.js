import {
  restoreSession,
} from "../infra/auth/SessionService";

export function bootstrapAuthLayer() {

  restoreSession();

  console.log(
    "🔐 Auth layer booted"
  );

}