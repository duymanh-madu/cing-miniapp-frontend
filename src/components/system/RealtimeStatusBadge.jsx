import useSocketStatus from "@/shared/hooks/useSocketStatus";

/**
 * =====================================================
 * REALTIME BADGE
 * =====================================================
 */

function RealtimeStatusBadge() {

  const connected =
    useSocketStatus();

  return (

    <div
      className="
        fixed
        bottom-4
        right-4
        z-50
        rounded-full
        px-3
        py-2
        text-xs
        font-semibold
        bg-black
        text-white
      "
    >

      {
        connected
          ? "Realtime Connected"
          : "Realtime Offline"
      }

    </div>

  );

}

export default
  RealtimeStatusBadge;