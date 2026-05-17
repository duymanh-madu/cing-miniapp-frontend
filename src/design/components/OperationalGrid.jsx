import {
  memo,
} from "react";

function OperationalGrid({

  children,

}) {

  return (

    <div
      className="

        grid
        grid-cols-1

        gap-4

        md:grid-cols-2

      "
    >

      {children}

    </div>

  );

}

export default memo(
  OperationalGrid
);