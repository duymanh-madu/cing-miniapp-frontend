/**
 * =====================================================
 * RECONNECT STATE RECOVERY
 * =====================================================
 */

export async function recoverRealtimeState({

  recover,

}) {

  try {

    await recover();

    console.log(
      "🔄 Realtime state recovered"
    );

  } catch (error) {

    console.error(
      "Realtime recovery failed",
      error
    );

  }

}