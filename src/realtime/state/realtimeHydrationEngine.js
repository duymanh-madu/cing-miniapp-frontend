/**
 * =====================================================
 * REALTIME HYDRATION ENGINE
 * =====================================================
 */

export async function hydrateRealtimeState({

  hydrate,

}) {

  try {

    await hydrate();

    console.log(
      "💧 Realtime state hydrated"
    );

  } catch (error) {

    console.error(
      "Realtime hydration failed",
      error
    );

  }

}