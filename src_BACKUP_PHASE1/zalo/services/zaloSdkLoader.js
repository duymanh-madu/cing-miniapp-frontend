export async function waitForZaloSdk() {

  return new Promise(
    (resolve) => {

      if (

        window.zmp

      ) {

        resolve(
          window.zmp
        );

        return;

      }

      const interval =
        setInterval(() => {

          if (

            window.zmp

          ) {

            clearInterval(
              interval
            );

            resolve(
              window.zmp
            );

          }

        }, 100);

    }
  );

}