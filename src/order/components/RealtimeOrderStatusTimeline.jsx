import {
  memo,
} from "react";

function RealtimeOrderStatusTimeline({

  statuses = [],

}) {

  return (

    <div
      className="

        rounded-2xl
        bg-white

        p-4

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

        Live Status

      </h3>

      <div
        className="

          space-y-4

        "
      >

        {

          statuses.map(
            (status) => (

              <div
                key={status.id}
                className="flex gap-3"
              >

                <div
                  className="

                    mt-1

                    h-2
                    w-2

                    rounded-full

                    bg-black

                  "
                />

                <div>

                  <p
                    className="

                      text-sm
                      font-medium

                    "
                  >

                    {status.title}

                  </p>

                  <p
                    className="

                      text-xs
                      text-neutral-500

                    "
                  >

                    {status.time}

                  </p>

                </div>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default memo(
  RealtimeOrderStatusTimeline
);