class RenderScheduler {

  schedule(
    callback
  ) {

    requestAnimationFrame(
      () => {

        callback();

      }
    );

  }

}

const renderScheduler =
  new RenderScheduler();

export default
  renderScheduler;