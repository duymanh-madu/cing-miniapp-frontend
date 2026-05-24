import {
  useEffect,
} from "react";

import activationService from "@/zalo/activation/services/activationService";

import useActivationStore from "@/zalo/activation/store/activationRuntimeStore";

function ActivationGate({
  children,
}) {

  const activated =
    useActivationStore(
      (state) =>
        state.activated
    );

  const setActivated =
    useActivationStore(
      (state) =>
        state.setActivated
    );

  useEffect(() => {

    async function boot() {

      const result =
        await activationService
          .activate();

      if (result) {

        setActivated(
          true
        );

      }

    }

    boot();

  }, []);

  if (!activated) {

    return null;

  }

  return children;

}

export default
  ActivationGate;