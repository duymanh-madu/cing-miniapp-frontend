import {
  memo,
} from "react";

import SurfaceCard from "./SurfaceCard";

function MetricCard({

  label,

  value,

  suffix = "",

}) {

  return (

    <SurfaceCard>

      <p
        className="

          text-xs
          text-neutral-500

        "
      >

        {label}

      </p>

      <h2
        className="

          mt-2

          text-2xl
          font-bold

          tracking-tight

        "
      >

        {value}

        {suffix}

      </h2>

    </SurfaceCard>

  );

}

export default memo(
  MetricCard
);