import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

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

    runtimeLogger.info("ORDER", 
      `♻️ Order recovered: ${orderId}`
    );

  } catch (error) {

    runtimeLogger.error("ORDER", 
      `Order recovery failed: ${orderId}`,
      error
    );

  }

}

module.exports = {

  recoverOrder,

};