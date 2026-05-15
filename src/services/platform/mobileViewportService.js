/**
 * =========================================================
 * MOBILE VIEWPORT SERVICE
 * =========================================================
 */

class MobileViewportService {

  initialized = false;

  init() {

    if (
      this.initialized
    ) {

      return;

    }

    this.updateHeight();

    window.addEventListener(
      "resize",
      this.updateHeight
    );

    this.initialized = true;

  }

  updateHeight = () => {

    document.documentElement.style.setProperty(

      "--app-height",

      `${window.innerHeight}px`

    );

  };

}

const mobileViewportService =
  new MobileViewportService();

export default
  mobileViewportService;