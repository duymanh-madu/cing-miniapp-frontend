import {
  memo,
} from "react";

function RealtimeStatusPill({

  status,

}) {

  const styles = {

    live:
      "bg-green-100 text-green-700",

    pending:
      "bg-yellow-100 text-yellow-700",

    offline:
      "bg-neutral-200 text-neutral-600",

  };

  return (

    <div
      className={`

        inline-flex
        items-center

        rounded-full

        px-3
        py-1

        text-xs
        font-medium

        ${styles[status]}

      `}
    >

      {status}

    </div>

  );

}

export default memo(
  RealtimeStatusPill
);