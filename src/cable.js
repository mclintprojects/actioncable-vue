import actioncable from 'actioncable';
import Mixin from './mixin';

export default class Cable {
	cable = null;
	channels = { subscriptions: {} };

	constructor(Vue) {
		Vue.prototype.$cable = this;
		Vue.mixin(Mixin);
	}

	connect(url) {
		this.cable = actioncable.createConsumer(url);
	}

	subscribe(subscription) {
		if (this.cable) {
			const that = this;
			this.channels.subscriptions[
				subscription.name
			] = this.cable.subscriptions.create(subscription, {
				connected() {
					that._fireChannelEvent(subscription.channel, that._channelConnected);
				},
				disconnected() {
					that._fireChannelEvent(
						subscription.channel,
						that._channelDisconnected
					);
				},
				rejected() {
					that._fireChannelEvent(
						subscription.channel,
						that._subscriptionRejected
					);
				},
				received(data) {
					that._fireChannelEvent(
						subscription.channel,
						that._channelReceived,
						data
					);
				}
			});
		}
	}

	perform(channelName, action, data) {
		const subscription = this.channels.subscriptions[channelName];
		if (subscription) {
			subscription.perform(action, data);
		}
	}

	_channelConnected(channel) {
		channel.connected();
	}

	_channelDisconnected(channel) {
		channel.disconnected();
	}

	_subscriptionRejected(channel) {
		channel.rejected();
	}

	_channelReceived(channel, data) {
		channel.received(data);
	}

	_addChannel(name, value) {
		this.channels[name] = value;
		console.log('adding channel: ' + name);
	}

	_removeChannel(name) {
		delete this.channels[name];
		delete this.channels.subscriptions[name];
	}

	_fireChannelEvent(channelName, callback, data) {
		if (this.channels.hasOwnProperty(channelName)) {
			const channel = this.channels[channelName];
			callback(channel, data);
		}
	}
}
