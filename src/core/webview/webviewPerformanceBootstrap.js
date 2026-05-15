import zaloSdkRuntime
  from "./zaloSdkRuntime";

import webviewRuntime from "./webviewRuntime";

import visibilityRuntime from "@/core/visibility/visibilityRuntime";

import socketVisibilityBridge from "@/core/socket-runtime/socketVisibilityBridge";

import appLifecycleManager from "@/core/lifecycle/appLifecycleManager";

import webviewResumeRuntime from "@/core/lifecycle/webviewResumeRuntime";

import webviewSafeAreaRuntime from "./webviewSafeAreaRuntime";

class WebviewPerformanceBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    webviewRuntime
      .initialize();

    visibilityRuntime
      .initialize();

    socketVisibilityBridge
      .initialize();

    appLifecycleManager
      .initialize();

    webviewResumeRuntime
      .initialize();

    webviewSafeAreaRuntime
      .initialize();

    await zaloSdkRuntime
      .initialize();

    this.initialized =
      true;

  }

}

const webviewPerformanceBootstrap =
  new WebviewPerformanceBootstrap();

export default
  webviewPerformanceBootstrap;