export default {
	mounted() {
		if (this.$options.channels) {
			Object.entries(this.$options.channels).forEach(entry => {
				this.$cable._addChannel(entry[0], entry[1]);
			});
		}
	}
};
