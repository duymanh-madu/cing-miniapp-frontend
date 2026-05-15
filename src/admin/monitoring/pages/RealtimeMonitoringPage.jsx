import {
  useEffect,
} from "react";

import socketMonitoringSocket from "../socketMonitoringSocket";

import useSocketMonitoringStore from "../socketMonitoringStore";

function RealtimeMonitoringPage() {

  const {

    connections,

    rooms,

    events,

  } = useSocketMonitoringStore();

  useEffect(() => {

    socketMonitoringSocket
      .initialize();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-3
        "
      >

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-5
          "
        >

          <div
            className="
              text-sm
              text-white/60
            "
          >
            Active Connections
          </div>

          <div
            className="
              mt-3
              text-4xl
              font-black
            "
          >
            {connections}
          </div>

        </div>

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-5
          "
        >

          <div
            className="
              text-sm
              text-white/60
            "
          >
            Active Rooms
          </div>

          <div
            className="
              mt-3
              text-4xl
              font-black
            "
          >
            {rooms.length}
          </div>

        </div>

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-5
          "
        >

          <div
            className="
              text-sm
              text-white/60
            "
          >
            Event Throughput
          </div>

          <div
            className="
              mt-3
              text-4xl
              font-black
            "
          >
            {events.length}
          </div>

        </div>

      </div>

      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-5
        "
      >

        <pre
          className="
            overflow-auto
            text-xs
          "
        >

          {

            JSON.stringify(
              {
                rooms,
                events,
              },
              null,
              2
            )

          }

        </pre>

      </div>

    </div>

  );

}

export default
  RealtimeMonitoringPage;