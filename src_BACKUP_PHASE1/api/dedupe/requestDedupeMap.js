const pendingRequests =
  new Map();

export function getPendingRequest(

  key

) {

  return pendingRequests.get(
    key
  );

}

export function setPendingRequest({

  key,

  promise,

}) {

  pendingRequests.set(
    key,
    promise
  );

}

export function clearPendingRequest(

  key

) {

  pendingRequests.delete(
    key
  );

}