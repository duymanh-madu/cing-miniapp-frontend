class RuntimeGraphCompiler {

  compile({
    nodes = [],
    edges = [],
  }) {

    return {

      graph: {

        nodes,

        edges,

      },

      executable:
        true,

      compiledAt:
        Date.now(),

    };

  }

}

const runtimeGraphCompiler =
  new RuntimeGraphCompiler();

export default
  runtimeGraphCompiler;