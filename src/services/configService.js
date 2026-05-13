import axios from "axios";

import {
  API_BASE_URL,
} from "@/config/appConfig";

/**
 * =========================================================
 * CONFIG SERVICE
 * =========================================================
 */

export async function fetchAppConfig() {

  const response =
    await axios.get(
      `${API_BASE_URL}/app/config`
    );

  return response.data;

}