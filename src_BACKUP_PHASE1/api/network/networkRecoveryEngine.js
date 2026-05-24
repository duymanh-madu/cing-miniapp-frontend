export function initializeNetworkRecovery({

  onReconnect,

}) {

  window.addEventListener(
    "online",
    onReconnect
  );

}