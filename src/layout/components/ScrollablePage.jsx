import {
  memo,
} from "react";

function ScrollablePage({

  children,

}) {

  return (

    <div
      className="

        overflow-x-hidden

      "
    >

      {children}

    </div>

  );

}

export default memo(
  ScrollablePage
);