import telemetryRuntime from "@/core/telemetry/telemetryRuntime";

class FrontendAnalyticsRuntime {

  trackPage({
    page,
  }) {

    telemetryRuntime.track({

      type:
        "page.view",

      payload: {

        page,

      },

    });

  }

  trackAction({
    action,
    payload,
  }) {

    telemetryRuntime.track({

      type:
        "action",

      payload: {

        action,

        payload,

      },

    });

  }

}

const frontendAnalyticsRuntime =
  new FrontendAnalyticsRuntime();

export default
  frontendAnalyticsRuntime;