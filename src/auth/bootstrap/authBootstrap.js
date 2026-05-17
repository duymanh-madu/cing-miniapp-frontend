import {
  restoreSession,
} from "../services/authSessionService";

export function bootstrapAuthLayer() {

  restoreSession();

  console.log(
    "🔐 Auth layer booted"
  );

}