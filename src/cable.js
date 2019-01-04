import actioncable from 'actioncable';

export default class Cable {
	constructor(Vue) {
		this.vueInstance = Vue;
		Vue.prototype.$cable = this;
	}

	connect(url) {
		this.cable = actioncable.createConsumer(url);
	}

	subscribe(subscription) {
		actioncable.subscriptions.create(subscription, {
			connected() {
				this._channelConnected(subscription.channel);
			},
			disconnected() {
				this._channelDisconnected(subscription.channel);
			},
			rejected() {
				this._subscriptionRejected(subscription.channel);
			},
			received(data) {
				this._channelReceived(subscription.channel, data);
			}
		});
	}

	_channelConnected(name) {
		const channel = this.vueInstance.channels[name];
		if (channel) channel.connected();
	}

	_channelDisconnected(name) {
		const channel = this.vueInstance.channels[name];
		if (channel) channel.disconnected();
	}

	_subscriptionRejected(name) {
		const channel = this.vueInstance.channels[name];
		if (channel) channel.rejected();
	}

	_channelReceived(name, data) {
		const channel = this.vueInstance.channels[name];
		if (channel) channel.received(data);
	}
}
