const socketQueue =
  [];

export function enqueueSocketEvent(

  event

) {

  socketQueue.push(
    event
  );

}

export function flushSocketQueue() {

  const cloned =
    [...socketQueue];

  socketQueue.length = 0;

  return cloned;

}