let frame =
  null;

export function batchRender(
  callback
) {

  if (frame) {

    cancelAnimationFrame(
      frame
    );

  }

  frame =
    requestAnimationFrame(
      callback
    );

}