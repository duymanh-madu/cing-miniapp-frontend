export function safeTimeout({

  callback,

  timeout,

}) {

  let active =
    true;

  const timer =
    setTimeout(() => {

      if (active) {

        callback();

      }

    }, timeout);

  return () => {

    active =
      false;

    clearTimeout(
      timer
    );

  };

}