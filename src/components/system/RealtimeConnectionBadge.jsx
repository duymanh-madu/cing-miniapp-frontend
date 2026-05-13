import {
  FaBolt,
  FaWifi,
} from "react-icons/fa6";

import useSocketStore from "../../stores/socketStore";

/**
 * ============================================
 * REALTIME CONNECTION BADGE
 * ============================================
 */

function RealtimeConnectionBadge() {
  const connected =
    useSocketStore(
      (state) =>
        state.connected
    );

  const latency =
    useSocketStore(
      (state) =>
        state.latency
    );

  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        bg-white
        px-4
        py-2
        shadow-[0_10px_25px_rgba(0,0,0,0.06)]
      "
    >
      <div
        className={`
          flex
          h-2.5
          w-2.5
          rounded-full

          ${
            connected
              ? "bg-green-500"
              : "bg-red-500"
          }
        `}
      />

      <FaWifi
        className="
          text-[12px]
          text-brand-orange
        "
      />

      <span
        className="
          text-[12px]
          font-bold
          text-gray-700
        "
      >
        {connected
          ? `Realtime ${
              latency ||
              0
            }ms`
          : "Disconnected"}
      </span>

      <FaBolt
        className="
          text-[10px]
          text-yellow-500
        "
      />
    </div>
  );
}

export default RealtimeConnectionBadge;