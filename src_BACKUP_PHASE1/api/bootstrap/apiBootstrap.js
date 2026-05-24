import {
  initializeNetworkRecovery,
} from "../network/networkRecoveryEngine";

export function bootstrapApiLayer() {

  initializeNetworkRecovery({

    onReconnect() {

      console.log(
        "🌐 Network reconnected"
      );

    },

  });

  console.log(
    "🚀 API layer booted"
  );

}