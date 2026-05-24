class RuntimeSchemaHydrator {

  hydrate({
    schema,
    payload,
  }) {

    return {

      ...schema,

      hydratedPayload:
        payload,

    };

  }

}

const runtimeSchemaHydrator =
  new RuntimeSchemaHydrator();

export default
  runtimeSchemaHydrator;