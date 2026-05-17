import {
  memo,
} from "react";

import SectionHeader from "./SectionHeader";

function OperationalSection({

  title,

  description,

  children,

}) {

  return (

    <section>

      <SectionHeader
        title={title}
        description={description}
      />

      {children}

    </section>

  );

}

export default memo(
  OperationalSection
);