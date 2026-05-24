/**
 * =========================================================
 * PLATFORM SERVICE
 * =========================================================
 */

class PlatformService {

  isMobile() {

    return /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  }

  isZalo() {

    return /Zalo/i.test(
      navigator.userAgent
    );

  }

  isIOS() {

    return /iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  }

  isAndroid() {

    return /Android/i.test(
      navigator.userAgent
    );

  }

}

const platformService =
  new PlatformService();

export default
  platformService;