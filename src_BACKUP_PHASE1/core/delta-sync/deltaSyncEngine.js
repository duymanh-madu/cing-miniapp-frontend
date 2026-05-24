class DeltaSyncEngine {

  calculateDelta({
    previous,
    next,
  }) {

    const delta =
      {};

    Object.keys(
      next
    ).forEach(
      (
        key
      ) => {

        if (
          previous[key] !==
          next[key]
        ) {

          delta[key] =
            next[key];

        }

      }
    );

    return delta;

  }

}

const deltaSyncEngine =
  new DeltaSyncEngine();

export default
  deltaSyncEngine;