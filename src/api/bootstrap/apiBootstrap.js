import {
  initializeNetworkRecovery,
} from "../network/networkRecoveryEngine";

export function bootstrapApiLayer() {

  initializeNetworkRecovery({

    onReconnect() {


    },

  });


}
