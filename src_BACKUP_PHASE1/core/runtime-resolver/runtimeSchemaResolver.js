class RuntimeSchemaResolver {

  resolve({
    schema,
    runtimeState,
  }) {

    return {

      ...schema,

      runtimeState,

    };

  }

}

const runtimeSchemaResolver =
  new RuntimeSchemaResolver();

export default
  runtimeSchemaResolver;