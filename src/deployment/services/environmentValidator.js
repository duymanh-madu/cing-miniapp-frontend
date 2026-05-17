import {
  ENVIRONMENT_CONFIG,
} from "../config/environmentConfig";

export function validateEnvironment() {

  if (

    !ENVIRONMENT_CONFIG.API_URL

  ) {

    throw new Error(
      "Missing API URL"
    );

  }

  if (

    !ENVIRONMENT_CONFIG.SOCKET_URL

  ) {

    throw new Error(
      "Missing SOCKET URL"
    );

  }

}