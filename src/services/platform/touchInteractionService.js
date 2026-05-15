/**
 * =========================================================
 * TOUCH INTERACTION SERVICE
 * =========================================================
 */

class TouchInteractionService {

  initialized = false;

  init() {

    if (
      this.initialized
    ) {

      return;

    }

    document.addEventListener(
      "touchstart",
      () => {},
      {
        passive: true,
      }
    );

    this.initialized = true;

  }

}

const touchInteractionService =
  new TouchInteractionService();

export default
  touchInteractionService;