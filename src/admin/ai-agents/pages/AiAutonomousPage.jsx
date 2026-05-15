import {
  useEffect,
} from "react";

import aiAgentBootstrap from "../aiAgentBootstrap";

import aiAgentRealtimeSocket from "../aiAgentRealtimeSocket";

import useAiAgentStore from "../aiAgentStore";

import AiAgentGrid from "../components/AiAgentGrid";

import AutonomousActionFeed from "../components/AutonomousActionFeed";

function AiAutonomousPage() {

  const {

    aiAgents,

    autonomousActions,

  } = useAiAgentStore();

  useEffect(() => {

    aiAgentBootstrap
      .bootstrap();

    aiAgentRealtimeSocket
      .initialize();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Autonomous AI Operating Platform
      </div>

      <AiAgentGrid
        agents={
          aiAgents
        }
      />

      <AutonomousActionFeed
        actions={
          autonomousActions
        }
      />

    </div>

  );

}

export default
  AiAutonomousPage;