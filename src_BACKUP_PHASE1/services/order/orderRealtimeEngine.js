const {

  realtimeEventBus,

} = require(
  "../realtime/realtimeEventBus"
);

const {

  REALTIME_EVENTS,

} = require(
  "../realtime/realtimeEventConstants"
);

/**
 * =====================================================
 * ORDER REALTIME ENGINE
 * =====================================================
 */

function emitOrderUpdate({

  orderId,

  status,

  payload,

}) {

  realtimeEventBus.publish({

    event:
      REALTIME_EVENTS
        .ORDER_STATUS_CHANGED,

    room:
      `room:order:${orderId}`,

    payload: {

      orderId,

      status,

      ...payload,

    },

  });

}

module.exports = {

  emitOrderUpdate,

};