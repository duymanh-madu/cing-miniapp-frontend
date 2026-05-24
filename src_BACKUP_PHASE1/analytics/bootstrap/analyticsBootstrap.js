import {
  initializeAnalyticsSession,
} from "../services/sessionManager";

export function bootstrapAnalyticsLayer() {

  initializeAnalyticsSession();

  console.log(
    "📊 Analytics layer booted"
  );

}