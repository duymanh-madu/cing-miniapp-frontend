import {
  memo,
} from "react";

function NotificationItem({

  title,

  message,

}) {

  return (

    <div
      className="

        rounded-2xl

        border
        border-neutral-200

        bg-white

        p-4

        shadow-sm

      "
    >

      <h4
        className="

          text-sm
          font-semibold

        "
      >

        {title}

      </h4>

      <p
        className="

          mt-1

          text-sm
          text-neutral-500

        "
      >

        {message}

      </p>

    </div>

  );

}

export default memo(
  NotificationItem
);