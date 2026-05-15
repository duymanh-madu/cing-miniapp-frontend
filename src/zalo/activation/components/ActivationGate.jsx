import { useEffect } from "react";

import activationRuntime from "../activationRuntime";

import useActivationStore from "../activationStore";

function ActivationGate() {
  const activated =
    useActivationStore(
      (state) => state.activated
    );

  useEffect(() => {
    if (activated) {
      return;
    }

    activationRuntime.activate();
  }, [activated]);

  return null;
}

export default ActivationGate;