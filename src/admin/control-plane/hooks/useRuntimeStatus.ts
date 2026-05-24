import { useEffect, useState } from "react";

export function useRuntimeStatus() {

  const [status, setStatus] = useState<any>({});

  useEffect(() => {

    const interval = setInterval(() => {

      // mock hook to connect runtime engine (replace with socket later)
      setStatus({
        uptime: performance.now(),
        modules: Math.floor(Math.random() * 10),
        healthy: true,
      });

    }, 2000);

    return () => clearInterval(interval);

  }, []);

  return status;
}
