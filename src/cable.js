import actioncable from 'actioncable';
import Logger from './logger';
import Mixin from './mixin';

export default class Cable {
	_logger = null;
	_cable = null;
	_channels = { subscriptions: {} };
	_components = {};

	constructor(Vue, { debug }) {
		Vue.prototype.$cable = this;
		Vue.mixin(Mixin);
		this._logger = new Logger(debug);
	}

	connect(url) {
		if (typeof url == string) {
			this._cable = actioncable.createConsumer(url);
		} else throw new Error('Connection URL needs to be of type String.');
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
		} else {
			throw new Error(
				`ActionCableVue not initialized. Please call 'this.$cable.connect(url)' first.`
			);
		}
	}

	perform(channelName, action, data) {
		_logger.log(`Performing action: '${action}' on channel '${channelName}'.`);
		const subscription = this._channels.subscriptions[channelName];
		if (subscription) {
			subscription.perform(action, data);
			_logger.log(`Performed: '${action}' on channel '${channelName}'.`);
		} else {
			_logger.log(
				`Could not perform action: '${action}' on channel '${channelName}'.`
			);
		}
	}

	_channelConnected(channel) {
		channel.connected.call(this._components[channel._uid]);
		_logger.log(`Successfully connected to channel '${channel}.'`);
	}

	_channelDisconnected(channel) {
		channel.disconnected.call(this._components[channel._uid]);
		_logger.log(`Successfully disconnected from channel '${channel}'.`);
	}

	_subscriptionRejected(channel) {
		channel.rejected.call(this._components[channel._uid]);
		_logger.log(`Subscription rejected for channel '${channel}'.`);
	}

	_channelReceived(channel, data) {
		channel.received.call(this._components[channel._uid], data);
		_logger.log(`Message received on channel '${channel}'.`);
	}

	_addChannel(name, value, component) {
		value._uid = component._uid;
		this._channels[name] = value;
		this._addComponent(component);
		_logger.log('adding channel: ' + name);
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
