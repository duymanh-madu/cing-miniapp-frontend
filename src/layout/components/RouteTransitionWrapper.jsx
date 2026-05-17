import {
  memo,
} from "react";

function RouteTransitionWrapper({

  children,

}) {

  return (

    <div
      className="

        animate-in
        fade-in

        duration-150

      "
    >

      {children}

    </div>

  );

}

export default memo(
  RouteTransitionWrapper
);