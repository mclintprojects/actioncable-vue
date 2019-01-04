export default {
	mounted() {
		if (this.$options.channels) {
			Object.entries(this.$options.channels).forEach(entry => {
				this.$cable._addChannel(entry[0], entry[1], this);
			});
		}
	},
	destroyed() {
		if (this.$options.channels) {
			Object.keys(this.$options.channels).forEach(key =>
				this.$cable._removeChannel(key)
			);
		}
	}
};
