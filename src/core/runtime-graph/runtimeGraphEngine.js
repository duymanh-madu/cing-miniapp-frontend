class RuntimeGraphEngine {

  createGraph({
    nodes = [],
    edges = [],
  }) {

    return {

      nodes,

      edges,

    };

  }

  resolveNode(
    graph,
    nodeId
  ) {

    return graph.nodes.find(
      (
        node
      ) =>
        node.id ===
        nodeId
    );

  }

}

const runtimeGraphEngine =
  new RuntimeGraphEngine();

export default
  runtimeGraphEngine;