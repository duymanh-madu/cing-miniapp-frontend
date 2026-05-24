class SchemaRuntimeCompiler {

  compile(
    schema
  ) {

    return {

      id:
        schema.id,

      type:
        schema.type,

      props:
        schema.props || {},

      children:
        schema.children || [],

      bindings:
        schema.bindings || {},

      actions:
        schema.actions || [],

    };

  }

}

const schemaRuntimeCompiler =
  new SchemaRuntimeCompiler();

export default
  schemaRuntimeCompiler;