import {
  Suspense,
} from "react";

function AdminAppShell({
  children,
}) {

  return (

    <Suspense

      fallback={

        <div
          className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-zinc-950
            text-white
          "
        >

          Admin Loading...

        </div>

      }

    >

      {children}

    </Suspense>

  );

}

export default
  AdminAppShell;