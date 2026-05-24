import {
  useState,
} from "react";

import automationService from "../automationService";

function WorkflowBuilderForm() {

  const [
    name,
    setName,
  ] = useState("");

  const [
    trigger,
    setTrigger,
  ] = useState("");

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    await automationService
      .createWorkflow({

        name,

        trigger,

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
        placeholder="Workflow Name"
        className="
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <input
        value={trigger}
        onChange={(event) =>
          setTrigger(
            event.target.value
          )
        }
        placeholder="Trigger Event"
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
        Create Workflow
      </button>

    </form>

  );

}

export default
  WorkflowBuilderForm;