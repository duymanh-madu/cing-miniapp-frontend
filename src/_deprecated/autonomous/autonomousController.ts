import { decisionEngine } from "./decisionEngine";
import { learningEngine } from "./learningEngine";

class AutonomousController {

  execute(context: any) {

    const decision = decisionEngine.decide(context);

    learningEngine.learn({
      type: "DECISION",
      decision,
      context,
    });

    return decision;
  }

}

export const autonomousController = new AutonomousController();
