import {
  useEffect,
  useState,
} from "react";

export function useLowMemoryMode() {

  const [

    enabled,

    setEnabled,

  ] = useState(false);

  useEffect(() => {

    const lowMemory =
      navigator.deviceMemory &&
      navigator.deviceMemory <= 4;

    setEnabled(
      lowMemory
    );

  }, []);

  return enabled;

}