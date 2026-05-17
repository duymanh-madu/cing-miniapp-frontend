import {
  memo,
} from "react";

function OperationalList({

  items,

  renderItem,

}) {

  return (

    <div
      className="

        divide-y
        divide-neutral-100

      "
    >

      {

        items.map(
          renderItem
        )

      }

    </div>

  );

}

export default memo(
  OperationalList
);