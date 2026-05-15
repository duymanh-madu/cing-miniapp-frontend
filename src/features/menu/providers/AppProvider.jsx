import QueryProvider
  from "./QueryProvider";

import RuntimeProvider
  from "./RuntimeProvider";

import SocketProvider
  from "./SocketProvider";

import ThemeProvider
  from "./ThemeProvider";

import MenuProvider
  from "@/features/menu/providers/MenuProvider";

function AppProvider({
  children,
}) {

  return (

    <ThemeProvider>

      <QueryProvider>

        <RuntimeProvider>

          <SocketProvider>

            <MenuProvider>

              {children}

            </MenuProvider>

          </SocketProvider>

        </RuntimeProvider>

      </QueryProvider>

    </ThemeProvider>

  );

}

export default
  AppProvider;