import automationService from "./automationService";

import useAutomationStore from "./automationStore";

class AutomationBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useAutomationStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const [

        workflows,

        automationMetrics,

      ] = await Promise.all([

        automationService
          .getWorkflows(),

        automationService
          .getMetrics(),

      ]);

      store.setWorkflows(
        workflows
      );

      store.setAutomationMetrics(
        automationMetrics
      );

    } finally {

      store.setLoading(
        false
      );

      this.initialized =
        true;

    }

  }

}

const automationBootstrap =
  new AutomationBootstrap();

export default
  automationBootstrap;