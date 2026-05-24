const crypto =
  window.crypto;

const toastQueue =
  [];

export function pushToast(

  toast

) {

  toastQueue.push({

    id:
      crypto.randomUUID(),

    createdAt:
      Date.now(),

    ...toast,

  });

}

export function shiftToast() {

  return toastQueue.shift();

}

export function getToastQueue() {

  return toastQueue;

}