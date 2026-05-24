import useAdminRealtime from "../shared/hooks/useAdminRealtime";

function RealtimeConnectionBadge() {

  const realtime =
    useAdminRealtime();

  return (

    <div
      className="
        flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-black/40
        px-4
        py-2
        text-xs
      "
    >

      <div
        className={`

          h-2
          w-2
          rounded-full

          ${

            realtime.connected

              ? "bg-green-500"

              : "bg-red-500"

          }

        `}
      />

      <div>

        {

          realtime.connected

            ? "Realtime Connected"

            : "Realtime Disconnected"

        }

      </div>

    </div>

  );

}

export default
  RealtimeConnectionBadge;