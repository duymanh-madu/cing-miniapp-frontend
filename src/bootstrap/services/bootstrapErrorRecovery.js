export async function bootstrapSafe({

  bootstrap,

  fallback,

}) {

  try {

    await bootstrap();

  } catch (error) {

    console.error(
      error
    );

    fallback?.();

  }

}