import triggerEngineService from "../triggerEngineService";

function TriggerActionPanel() {

  async function handleVoucher() {

    await triggerEngineService
      .triggerVoucher({

        trigger:
          "campaign-runtime",

      });

  }

  async function handleNotification() {

    await triggerEngineService
      .triggerNotification({

        trigger:
          "campaign-runtime",

      });

  }

  async function handleLoyalty() {

    await triggerEngineService
      .triggerLoyalty({

        trigger:
          "campaign-runtime",

      });

  }

  return (

    <div
      className="
        grid
        grid-cols-1
        gap-4
        md:grid-cols-3
      "
    >

      <button
        onClick={
          handleVoucher
        }

        className="
          rounded-3xl
          bg-white
          p-5
          text-black
          font-black
        "
      >
        Trigger Voucher
      </button>

      <button
        onClick={
          handleNotification
        }

        className="
          rounded-3xl
          bg-white
          p-5
          text-black
          font-black
        "
      >
        Trigger Notification
      </button>

      <button
        onClick={
          handleLoyalty
        }

        className="
          rounded-3xl
          bg-white
          p-5
          text-black
          font-black
        "
      >
        Trigger Loyalty
      </button>

    </div>

  );

}

export default
  TriggerActionPanel;