export async function safeAsyncHandler({

  request,

  fallback,

}) {

  try {

    return await request();

  } catch (error) {

    console.error(
      error
    );

    return fallback?.();

  }

}