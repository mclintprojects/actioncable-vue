import objectPolyfill from "./polyfill";

function unsubscribe(context) {
  if (context.$options.channels || context.channels || (context.$.type && context.$.type.channels)) {
    const channels = context.$ ? context.$.type.channels : (context.channels || context.$options.channels);
    Object.entries(channels).forEach(([channelName, channelValue]) => {
      if (channelName === "computed") {
        channelValue.forEach((channel) => {
          const computedChannelName = channel.channelName.call(context);
          context.$cable._removeChannel(computedChannelName, context._uid);
        });
      } else {
        context.$cable._removeChannel(channelName, context._uid);
      }
    });
  }
}

function subscribe(context) {
  if (context.$options.channels || context.channels || (context.$.type && context.$.type.channels)) {
    // polyfill Object.entries and Object.keys
    objectPolyfill();

    const channels = context.$ ? context.$.type.channels : (context.channels || context.$options.channels);

    Object.entries(channels).forEach(entry => {
      context.$cable._registerChannel(entry, context);
    });
  }
}

export default {
  /**
   * Retrieve channels in component once mounted.
   */
  beforeCreate() {
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
    $resubscribeToCableChannels() {
      subscribe(this);
    },
  },
};
