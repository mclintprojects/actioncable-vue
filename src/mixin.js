export default {
  /**
   * Retrieve channels in component once mounted.
   */
  mounted() {
    if (this.$options.channels) {
      Object.entries(this.$options.channels).forEach((entry) => {
        if (entry[0] != "computed")
          this.$cable._addChannel(entry[0], entry[1], this);
        else {
          const computedChannels = entry[1];
          computedChannels.forEach((channel) => {
            const channelName = channel.channelName();
            const channelObject = {
              connected: channel["connected"],
              rejected: channel["rejected"],
              disconnected: channel["disconnected"],
              received: channel["received"],
            };

            this.$options.channels[channelName] = channelObject;
            this.$cable._addChannel(channelName, channelObject, this);
          });
        }
      });
    }
  },
  /**
   * Unsubscribe from channels when component is destroyed.
   */
  destroyed() {
    if (this.$options.channels) {
      Object.keys(this.$options.channels).forEach((key) =>
        this.$cable._removeChannel(key)
      );
    }
  },
};
