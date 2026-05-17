import {
  memo,
} from "react";

function RenderIsolationWrapper({

  children,

}) {

  return children;

}

export default memo(
  RenderIsolationWrapper
);