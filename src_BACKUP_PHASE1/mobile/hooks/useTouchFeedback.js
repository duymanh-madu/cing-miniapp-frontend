export function useTouchFeedback() {

  function triggerFeedback() {

    if (
      navigator.vibrate
    ) {

      navigator.vibrate(10);

    }

  }

  return {

    triggerFeedback,

  };

}