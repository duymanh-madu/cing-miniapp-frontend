import {
  useState,
} from "react";

import loyaltyService from "../loyaltyService";

function RewardBuilderForm() {

  const [
    name,
    setName,
  ] = useState("");

  const [
    points,
    setPoints,
  ] = useState("");

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    await loyaltyService
      .createReward({

        name,

        points,

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
        placeholder="Reward Name"
        className="
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <input
        value={points}
        onChange={(event) =>
          setPoints(
            event.target.value
          )
        }
        placeholder="Required Points"
        className="
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
        Create Reward
      </button>

    </form>

  );

}

export default
  RewardBuilderForm;