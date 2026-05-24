import realtimeSocket from "../socket";

export function socketSafeEmit({

  event,

  payload,

}) {

  if (

    !realtimeSocket.connected

  ) {

    return false;

  }

  realtimeSocket.emit(

    event,

    payload

  );

  return true;

}