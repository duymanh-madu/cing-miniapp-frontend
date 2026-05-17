import {
  memo,
} from "react";

import {
  useRuntimeStore,
} from "../store/runtimeStore";

function RuntimeHealthCard() {

  const {

    runtimeErrors,

    duplicateListeners,

    memoryWarnings,

  } = useRuntimeStore();

  return (

    <div
      className="

        rounded-3xl

        bg-white

        p-5

        shadow-sm

      "
    >

      <h3
        className="

          mb-4

          text-sm
          font-semibold

        "
      >

        Runtime Health

      </h3>

      <div
        className="space-y-2 text-sm"
      >

        <p>

          Errors:
          {" "}
          {runtimeErrors.length}

        </p>

        <p>

          Duplicate listeners:
          {" "}
          {duplicateListeners}

        </p>

        <p>

          Memory warnings:
          {" "}
          {memoryWarnings}

        </p>

      </div>

    </div>

  );

}

export default memo(
  RuntimeHealthCard
);