export function throttle(

  callback,

  delay

) {

  let waiting =
    false;

  return (...args) => {

    if (waiting) {

      return;

    }

    callback(...args);

    waiting =
      true;

    setTimeout(() => {

      waiting =
        false;

    }, delay);

  };

}