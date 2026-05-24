import {
  useState,
} from "react";

import campaignSchedulerService from "../campaignSchedulerService";

function CampaignSchedulerForm() {

  const [
    name,
    setName,
  ] = useState("");

  const [
    cron,
    setCron,
  ] = useState("");

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    await campaignSchedulerService
      .createSchedule({

        name,

        cron,

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
        placeholder="Schedule Name"
        className="
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <input
        value={cron}
        onChange={(event) =>
          setCron(
            event.target.value
          )
        }
        placeholder="Cron Expression"
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
          text-sm
          font-bold
          text-black
        "
      >
        Create Schedule
      </button>

    </form>

  );

}

export default
  CampaignSchedulerForm;