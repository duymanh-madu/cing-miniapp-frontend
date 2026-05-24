export function isIosDevice() {

  return /iPhone|iPad|iPod/i.test(

    navigator.userAgent

  );

}