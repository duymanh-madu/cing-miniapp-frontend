import {
  useState,
} from "react";

import campaignService from "../campaignService";

function CampaignBuilderForm() {

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

    await campaignService
      .createCampaign({

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
        border
        border-white/10
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
        placeholder="Campaign Name"
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
        placeholder="Description"
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
          text-sm
          font-bold
          text-black
        "
      >
        Create Campaign
      </button>

    </form>

  );

}

export default
  CampaignBuilderForm;