import {
  useState,
} from "react";

import notificationService from "../notificationService";

function NotificationBuilderForm() {

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    channel,
    setChannel,
  ] = useState(
    "zalo"
  );

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    await notificationService
      .createNotification({

        title,

        message,

        channel,

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
        value={title}
        onChange={(event) =>
          setTitle(
            event.target.value
          )
        }
        placeholder="Notification Title"
        className="
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <textarea
        value={message}
        onChange={(event) =>
          setMessage(
            event.target.value
          )
        }
        placeholder="Message Content"
        className="
          h-40
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      />

      <select
        value={channel}
        onChange={(event) =>
          setChannel(
            event.target.value
          )
        }
        className="
          w-full
          rounded-2xl
          bg-black/40
          p-4
        "
      >

        <option value="zalo">
          Zalo OA
        </option>

        <option value="push">
          Push
        </option>

        <option value="sms">
          SMS
        </option>

        <option value="email">
          Email
        </option>

      </select>

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
        Create Notification
      </button>

    </form>

  );

}

export default
  NotificationBuilderForm;