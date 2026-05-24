import {
  validateEnvironment,
} from "../services/environmentValidator";

export function bootstrapDeploymentLayer() {

  validateEnvironment();

  console.log(
    "🚀 Deployment layer booted"
  );

}