export function initializeRuntimeCleanup({

  cleanup,

  interval,

}) {

  return setInterval(

    cleanup,

    interval

  );

}