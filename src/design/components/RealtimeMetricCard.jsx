import {
  memo,
} from "react";

import SurfaceCard from "./SurfaceCard";

import RealtimeBadge from "./RealtimeBadge";

function RealtimeMetricCard({

  label,

  value,

}) {

  return (

    <SurfaceCard>

      <div
        className="

          flex
          items-center
          justify-between

        "
      >

        <p
          className="

            text-xs
            text-neutral-500

          "
        >

          {label}

        </p>

        <RealtimeBadge />

      </div>

      <h2
        className="

          mt-3

          text-3xl
          font-bold

        "
      >

        {value}

      </h2>

    </SurfaceCard>

  );

}

export default memo(
  RealtimeMetricCard
);