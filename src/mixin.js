export default {
  /**
   * Retrieve channels in component once mounted.
   */
  created() {
    console.log('created')
    if (this.$options.channels || this.channels) {
      const channels = this.channels || this.$options.channels;
      const entries = Object.entries(channels);

      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];

        if (entry[0] != "computed")
          this.$cable._addChannel(entry[0], { ...entry[1] }, this);
        else {
          const computedChannels = entry[1];
          computedChannels.forEach((channel) => {
            const channelName = channel.channelName.call(this);
            const channelObject = {
              connected: channel["connected"],
              rejected: channel["rejected"],
              disconnected: channel["disconnected"],
              received: channel["received"],
            };

            this.$cable._addChannel(channelName, channelObject, this);
          });
        }
      }
    }
  },
  /**
   * Unsubscribe from channels when component is destroyed.
   */
  beforeDestroy() {
    if (this.$options.channels || this.channels) {
      const channels = this.channels || this.$options.channels;
      const entries = Object.entries(channels);

      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];

        if (entry[0] != "computed")
          this.$cable._removeChannel(entry[0], this._uid)
        else {
          const computedChannels = entry[1];
          computedChannels.forEach((channel) => {
            const channelName = channel.channelName.call(this);
            this.$cable._removeChannel(channelName, this._uid);
          });
        }
      }
    }
  },
};
