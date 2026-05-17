import {
  memo,
} from "react";

function ContentSection({

  children,

}) {

  return (

    <section
      className="

        px-4
        py-4

      "
    >

      {children}

    </section>

  );

}

export default memo(
  ContentSection
);