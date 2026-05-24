const httpConfig =
  Object.freeze({

    baseURL:

      import.meta.env
        .VITE_API_URL ||

      "",

    timeout:
      15000,

  });

export default
  httpConfig;