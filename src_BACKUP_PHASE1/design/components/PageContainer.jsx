import {
  memo,
} from "react";

function PageContainer({

  children,

}) {

  return (

    <div
      className="

        min-h-screen

        bg-[#f5f7fb]

        pb-24

      "
    >

      {children}

    </div>

  );

}

export default memo(
  PageContainer
);