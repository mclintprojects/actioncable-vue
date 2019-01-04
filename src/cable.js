import actioncable from 'actioncable';
import Mixin from './mixin';

export default class Cable {
	_cable = null;
	_channels = { subscriptions: {} };
	_components = {};

	constructor(Vue) {
		Vue.prototype.$cable = this;
		Vue.mixin(Mixin);
	}

	connect(url) {
		this._cable = actioncable.createConsumer(url);
	}

	subscribe(subscription) {
		if (this._cable) {
			const that = this;
			this._channels.subscriptions[
				subscription.channel
			] = this._cable.subscriptions.create(subscription, {
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
		const subscription = this._channels.subscriptions[channelName];
		if (subscription) {
			subscription.perform(action, data);
		}
	}

	_channelConnected(channel) {
		channel.connected.call(this._components[channel._uid]);
	}

	_channelDisconnected(channel) {
		channel.disconnected.call(this._components[channel._uid]);
	}

	_subscriptionRejected(channel) {
		channel.rejected.call(this._components[channel._uid]);
	}

	_channelReceived(channel, data) {
		channel.received.call(this._components[channel._uid], data);
	}

	_addChannel(name, value, component) {
		value._uid = component._uid;
		this._channels[name] = value;
		this._addComponent(component);
		console.log('adding channel: ' + name);
	}

	_addComponent(component) {
		if (!this._components[component._uid]) {
			this._components[component._uid] = component;
		}
	}

	_removeChannel(name) {
		const uid = this._channels[name]._uid;
		delete this._channels[name];
		delete this._channels.subscriptions[name];
		delete this._components[uid];
	}

	_fireChannelEvent(channelName, callback, data) {
		if (this._channels.hasOwnProperty(channelName)) {
			const channel = this._channels[channelName];
			callback.call(this, channel, data);
		}
	}
}
