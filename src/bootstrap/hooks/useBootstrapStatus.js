import {
  useEffect,
  useState,
} from "react";

export function useBootstrapStatus() {

  const [

    booted,

    setBooted,

  ] = useState(false);

  useEffect(() => {

    setBooted(true);

  }, []);

  return booted;

}