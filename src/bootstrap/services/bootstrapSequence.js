export async function bootstrapSequence({

  layers,

}) {

  for (const layer of layers) {

    await layer();

  }

}