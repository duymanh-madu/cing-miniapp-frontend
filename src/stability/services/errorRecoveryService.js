export async function recoverFromError({

  recovery,

  delay,

}) {

  await new Promise(
    (resolve) =>

      setTimeout(
        resolve,
        delay
      )
  );

  return recovery();

}