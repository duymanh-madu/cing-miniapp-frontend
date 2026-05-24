/**
 * =====================================================
 * ORDER QUEUE ENGINE
 * =====================================================
 */

const orderQueue =
  [];

function enqueueOrder(

  order

) {

  orderQueue.push(
    order
  );

}

function dequeueOrder() {

  return orderQueue.shift();

}

function getOrderQueue() {

  return orderQueue;

}

module.exports = {

  enqueueOrder,

  dequeueOrder,

  getOrderQueue,

};