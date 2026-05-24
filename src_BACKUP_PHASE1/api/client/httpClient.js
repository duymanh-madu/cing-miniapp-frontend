import axios from "axios";

import {
  API_CONFIG,
} from "../config/apiConfig";

const httpClient =
  axios.create({

    baseURL:
      API_CONFIG.BASE_URL,

    timeout:
      API_CONFIG.REQUEST_TIMEOUT,

    headers: {

      "Content-Type":
        "application/json",

    },

  });

export default httpClient;