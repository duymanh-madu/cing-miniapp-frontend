import {
  useAppReady,
} from "@/hooks/useAppReady";

import QueryProvider from "./QueryProvider";

function AppProvider({
  children,
}) {

  useAppReady();

  return (

    <QueryProvider>

      {children}

    </QueryProvider>

  );

}

export default
  AppProvider;