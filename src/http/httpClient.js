import axios from "axios";

import httpConfig from "./httpConfig";

import {
  createHttpHeaders,
} from "./httpHeaders";

import {
  resolveHttpError,
} from "./resolveHttpError";

const httpClient =
  axios.create({

    baseURL:
      httpConfig.baseURL,

    timeout:
      httpConfig.timeout,

  });

httpClient.interceptors
  .request.use(

    (
      config
    ) => {

      config.headers =
        createHttpHeaders(
          config.headers
        );

      return config;

    }

  );

httpClient.interceptors
  .response.use(

    (
      response
    ) => response,

    (
      error
    ) => {

      return Promise.reject(

        resolveHttpError(
          error
        )

      );

    }

  );

export default
  httpClient;