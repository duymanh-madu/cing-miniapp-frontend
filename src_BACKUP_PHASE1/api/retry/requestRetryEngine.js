export async function retryRequest({

  request,

  retries,

  delay,

}) {

  let lastError =
    null;

  for (

    let attempt = 0;

    attempt <= retries;

    attempt++

  ) {

    try {

      return await request();

    } catch (error) {

      lastError =
        error;

      await new Promise(
        (resolve) =>

          setTimeout(
            resolve,
            delay
          )
      );

    }

  }

  throw lastError;

}