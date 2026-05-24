/**
 * =====================================================
 * ORDER STATUS ENGINE
 * =====================================================
 */

const ORDER_STATUS = {

  CREATED:
    "created",

  CONFIRMED:
    "confirmed",

  PREPARING:
    "preparing",

  READY:
    "ready",

  DELIVERING:
    "delivering",

  COMPLETED:
    "completed",

  CANCELLED:
    "cancelled",

};

/**
 * =====================================================
 * VALID TRANSITIONS
 * =====================================================
 */

const validTransitions = {

  created: [

    "confirmed",

    "cancelled",

  ],

  confirmed: [

    "preparing",

    "cancelled",

  ],

  preparing: [

    "ready",

    "cancelled",

  ],

  ready: [

    "delivering",

    "completed",

  ],

  delivering: [

    "completed",

  ],

  completed: [],

  cancelled: [],

};

function canTransition({

  from,

  to,

}) {

  return (

    validTransitions[
      from
    ]?.includes(to)

  );

}

module.exports = {

  ORDER_STATUS,

  canTransition,

};