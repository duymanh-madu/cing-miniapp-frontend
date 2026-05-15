let runtimeStarted =
  false;

function startRuntime() {

  if (
    runtimeStarted
  ) {

    return;

  }

  runtimeStarted =
    true;

}

function stopRuntime() {

  runtimeStarted =
    false;

}

export {

  startRuntime,

  stopRuntime,

};