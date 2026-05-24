import schemaRuntimeCompiler from "@/core/schema-runtime/schemaRuntimeCompiler";

class LowcodeExecutionCompiler {

  compile(
    schema
  ) {

    const compiled =
      schemaRuntimeCompiler
        .compile(
          schema
        );

    return {

      ...compiled,

      executable:
        true,

      compiledAt:
        Date.now(),

    };

  }

}

const lowcodeExecutionCompiler =
  new LowcodeExecutionCompiler();

export default
  lowcodeExecutionCompiler;