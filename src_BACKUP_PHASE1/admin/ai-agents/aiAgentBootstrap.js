import aiAgentService from "./aiAgentService";

import useAiAgentStore from "./aiAgentStore";

class AiAgentBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useAiAgentStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const [

        aiAgents,

        activeAgents,

      ] = await Promise.all([

        aiAgentService
          .getAgents(),

        aiAgentService
          .getActiveAgents(),

      ]);

      store.setAiAgents(
        aiAgents
      );

      store.setActiveAgents(
        activeAgents
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

const aiAgentBootstrap =
  new AiAgentBootstrap();

export default
  aiAgentBootstrap;