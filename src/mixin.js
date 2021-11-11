import objectPolyfill from "./polyfill";

function unsubscribe(context) {
  if (context.$options.channels || context.channels) {
    const channels = context.channels || context.$options.channels;
    const entries = Object.entries(channels);

    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];

      if (entry[0] !== "computed") {
        context.$cable._removeChannel(entry[0], context._uid);
      } else {
        const computedChannels = entry[1];
        computedChannels.forEach((channel) => {
          const channelName = channel.channelName.call(context);
          context.$cable._removeChannel(channelName, context._uid);
        });
      }
    }
  }
}

function subscribe(context) {
  if (context.$options.channels || context.channels) {
    // polyfill Object.entries and Object.keys
    objectPolyfill();

    const channels = context.channels || context.$options.channels;
    const entries = Object.entries(channels);

    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];

      if (entry[0] !== "computed") {
        context.$cable._addChannel(entry[0], { ...entry[1] }, context);
      } else {
        const computedChannels = entry[1];
        computedChannels.forEach((channel) => {
          const channelName = channel.channelName.call(context);
          const channelObject = {
            connected: channel.connected,
            rejected: channel.rejected,
            disconnected: channel.disconnected,
            received: channel.received,
          };

          context.$cable._addChannel(channelName, channelObject, context);
        });
      }
    }
  }
}

export default {
  /**
   * Retrieve channels in component once mounted.
   */
  created() {
    subscribe(this);
  },
  /**
   * Unsubscribe from channels when component is unmounted.
   */
  beforeUnmount() {
    unsubscribe(this);
  },
  /**
   * Unsubscribe from channels when component is destroyed.
   */
  beforeDestroy() {
    unsubscribe(this);
  },
  methods: {
    $reSubscribeCableChannels() {
      subscribe(this);
    },
  },
};
