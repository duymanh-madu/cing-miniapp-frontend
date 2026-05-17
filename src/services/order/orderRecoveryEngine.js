/**
 * =====================================================
 * ORDER RECOVERY ENGINE
 * =====================================================
 */

async function recoverOrder({

  orderId,

  recover,

}) {

  try {

    await recover();

    console.log(
      `♻️ Order recovered: ${orderId}`
    );

  } catch (error) {

    console.error(
      `Order recovery failed: ${orderId}`,
      error
    );

  }

}

module.exports = {

  recoverOrder,

};