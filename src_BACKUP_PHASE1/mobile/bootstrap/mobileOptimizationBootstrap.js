import {
  initializeMobileRecovery,
} from "../services/mobileRecoveryBridge";

export function bootstrapMobileOptimization() {

  initializeMobileRecovery();

  console.log(
    "📱 Mobile optimization booted"
  );

}