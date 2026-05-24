import { useEffect } from "react";

import toast from "react-hot-toast";

import useAppStore from "@/stores/app/appStore";

function useNetworkStatus() {
  const setOnline =
    useAppStore(
      (state) =>
        state.setOnline
    );

  useEffect(() => {
    function handleOnline() {
      setOnline(true);

      toast.success(
        "Đã kết nối internet"
      );
    }

    function handleOffline() {
      setOnline(false);

      toast.error(
        "Mất kết nối internet"
      );
    }

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);
}

export default useNetworkStatus;