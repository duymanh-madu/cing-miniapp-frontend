import {
  useEffect,
} from "react";

import channelBootstrap from "../channelBootstrap";

import useChannelStore from "../channelStore";

import ChannelHealthGrid from "../components/ChannelHealthGrid";

function ChannelManagementPage() {

  const {

    channels,

    channelHealth,

  } = useChannelStore();

  useEffect(() => {

    channelBootstrap
      .bootstrap();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Omnichannel Runtime
      </div>

      <ChannelHealthGrid
        health={
          channelHealth
        }
      />

      <div
        className="
          grid
          grid-cols-1
          gap-4
          xl:grid-cols-3
        "
      >

        {

          channels.map(
            (
              channel
            ) => (

              <div
                key={
                  channel.id
                }

                className="
                  rounded-3xl
                  bg-white/5
                  p-5
                "
              >

                <div
                  className="
                    text-xl
                    font-black
                  "
                >
                  {channel.name}
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    text-white/60
                  "
                >
                  {channel.description}
                </div>

              </div>

            )
          )

        }

      </div>

    </div>

  );

}

export default
  ChannelManagementPage;