import {
  memo,
} from "react";

function AppCrashFallback() {

  return (

    <div
      className="

        flex
        min-h-screen

        items-center
        justify-center

        bg-[#f5f7fb]

        p-6

      "
    >

      <div
        className="

          rounded-3xl

          bg-white

          p-6

          text-center

          shadow-sm

        "
      >

        <h2
          className="

            text-lg
            font-bold

          "
        >

          Something went wrong

        </h2>

        <p
          className="

            mt-2

            text-sm
            text-neutral-500

          "
        >

          Please reopen the app.

        </p>

      </div>

    </div>

  );

}

export default memo(
  AppCrashFallback
);