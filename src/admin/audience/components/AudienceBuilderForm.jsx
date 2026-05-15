import {
  useState,
} from "react";

import audienceService from "../audienceService";

function AudienceBuilderForm() {

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    await audienceService
      .createAudience({

        name,

        description,

      });

  }

  return (

    <form
      onSubmit={
        handleSubmit
      }

      className="
        space-y-4
        rounded-3xl
        bg-white/5
        p-5
      "
    >

      <input
        value={name}
        onChange={(event) =>
          setName(
            event.target.value
          )
        }
        placeholder="Audience Name"
        className="
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <textarea
        value={description}
        onChange={(event) =>
          setDescription(
            event.target.value
          )
        }
        placeholder="Audience Description"
        className="
          h-40
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <button
        type="submit"
        className="
          rounded-2xl
          bg-white
          px-5
          py-3
          font-bold
          text-black
        "
      >
        Create Audience
      </button>

    </form>

  );

}

export default
  AudienceBuilderForm;