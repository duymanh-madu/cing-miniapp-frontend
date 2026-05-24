import {
  useEffect,
} from "react";

import audienceBootstrap from "../audienceBootstrap";

import useAudienceStore from "../audienceStore";

import AudienceCard from "../components/AudienceCard";

import AudienceBuilderForm from "../components/AudienceBuilderForm";

function AudiencePage() {

  const audiences =
    useAudienceStore(
      (
        state
      ) => state.audiences
    );

  useEffect(() => {

    audienceBootstrap
      .bootstrap();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Audience Engine
      </div>

      <AudienceBuilderForm />

      <div
        className="
          grid
          grid-cols-1
          gap-4
          xl:grid-cols-3
        "
      >

        {

          audiences.map(
            (
              audience
            ) => (

              <AudienceCard
                key={
                  audience.id
                }

                audience={
                  audience
                }
              />

            )
          )

        }

      </div>

    </div>

  );

}

export default
  AudiencePage;