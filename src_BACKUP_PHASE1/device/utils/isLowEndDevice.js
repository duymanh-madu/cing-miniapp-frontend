export function isLowEndDevice() {

  return (

    navigator.deviceMemory &&
    navigator.deviceMemory <= 4

  );

}