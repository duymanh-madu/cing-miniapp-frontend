/**
 * =========================================================
 * REALTIME CHANNEL REGISTRY
 * =========================================================
 */

class RealtimeChannelRegistry {
  channels = new Map();

  register({
    channel,
    handlers = {},
  }) {
    if (!channel) {
      return;
    }

    this.channels.set(channel, {
      handlers,
    });
  }

  unregister(channel) {
    this.channels.delete(channel);
  }

  get(channel) {
    return this.channels.get(channel);
  }

  getAll() {
    return Array.from(
      this.channels.keys()
    );
  }
}

const realtimeChannelRegistry =
  new RealtimeChannelRegistry();

export default realtimeChannelRegistry;