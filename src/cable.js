import actioncable from 'actioncable';
import Mixin from './mixin';

export default class Cable {
	cable = null;
	channels = { subscriptions: {} };
	components = {};

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
				subscription.channel
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
		console.log(this.channels);
		const subscription = this.channels.subscriptions[channelName];
		if (subscription) {
			subscription.perform(action, data);
		}
	}

	_channelConnected(channel) {
		channel.connected.call(this.components[channel._uid]);
	}

	_channelDisconnected(channel) {
		channel.disconnected.call(this.components[channel._uid]);
	}

	_subscriptionRejected(channel) {
		channel.rejected.call(this.components[channel._uid]);
	}

	_channelReceived(channel, data) {
		channel.received.call(this.components[channel._uid], data);
	}

	_addChannel(name, value, component) {
		value._uid = component._uid;
		this.channels[name] = value;
		this._addComponent(component);
		console.log('adding channel: ' + name);
	}

	_addComponent(component) {
		if (!this.components[component._uid]) {
			this.components[component._uid] = component;
		}
	}

	_removeChannel(name) {
		const uid = this.channels[name]._uid;
		delete this.channels[name];
		delete this.channels.subscriptions[name];
		delete this.components[uid];
	}

	_fireChannelEvent(channelName, callback, data) {
		if (this.channels.hasOwnProperty(channelName)) {
			const channel = this.channels[channelName];
			callback.call(this, channel, data);
		}
	}
}
