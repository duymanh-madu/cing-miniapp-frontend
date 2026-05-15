import {
  Suspense,
} from "react";

function CustomerAppShell({
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
            bg-black
            text-white
          "
        >

          Loading...

        </div>

      }

    >

      {children}

    </Suspense>

  );

}

export default
  CustomerAppShell;