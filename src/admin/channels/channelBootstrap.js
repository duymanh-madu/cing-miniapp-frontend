import channelService from "./channelService";

import useChannelStore from "./channelStore";

class ChannelBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const [

      channels,

      channelHealth,

    ] = await Promise.all([

      channelService
        .getChannels(),

      channelService
        .getChannelHealth(),

    ]);

    const store =
      useChannelStore
        .getState();

    store.setChannels(
      channels
    );

    store.setChannelHealth(
      channelHealth
    );

    this.initialized =
      true;

  }

}

const channelBootstrap =
  new ChannelBootstrap();

export default
  channelBootstrap;