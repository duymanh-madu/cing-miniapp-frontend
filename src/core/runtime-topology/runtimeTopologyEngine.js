class RuntimeTopologyEngine {

  createTopology({
    nodes = [],
    edges = [],
  }) {

    return {

      nodes,

      edges,

      createdAt:
        Date.now(),

    };

  }

}

const runtimeTopologyEngine =
  new RuntimeTopologyEngine();

export default
  runtimeTopologyEngine;