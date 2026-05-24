import {
  useEffect,
} from "react";

import useActivationStore from "@/zalo/activation/store/activationRuntimeStore";

import sessionRuntime from "@/zalo/session/sessionRuntime";

function useActivation() {

  const setActivated =
    useActivationStore(
      (state) =>
        state.setActivated
    );

  useEffect(() => {

    const session =
      sessionRuntime
        .restore();

    if (session) {

      setActivated(
        true
      );

    }

  }, []);

}

export default
  useActivation;