import actioncable from 'actioncable';
import Logger from './logger';
import Mixin from './mixin';
import { connect } from 'tls';

export default class Cable {
	_logger = null;
	_cable = null;
	_channels = { subscriptions: {} };
	_components = {};

	constructor(Vue, options) {
		Vue.prototype.$cable = this;
		Vue.mixin(Mixin);

		const { debug, debugLevel } = options || {
			debug: false,
			debugLevel: 'error'
		};
		this._logger = new Logger(debug, debugLevel);

		this._connect(options.connectionUrl);
	}

	_connect(url) {
		if (typeof url == 'string') {
			this._cable = actioncable.createConsumer(url);
		} else {
			throw new Error(
				'Connection URL needs to be a valid Action Cable websocket server URL.'
			);
		}
	}

	subscribe(subscription, name) {
		if (this._cable) {
			const that = this;
			const channelName = name || subscription.channel;

			this._channels.subscriptions[
				channelName
			] = this._cable.subscriptions.create(subscription, {
				connected() {
					that._fireChannelEvent(channelName, that._channelConnected);
				},
				disconnected() {
					that._fireChannelEvent(channelName, that._channelDisconnected);
				},
				rejected() {
					that._fireChannelEvent(channelName, that._subscriptionRejected);
				},
				received(data) {
					that._fireChannelEvent(channelName, that._channelReceived, data);
				}
			});
		} else {
			throw new Error(
				`ActionCableVue not initialized. Please call 'this.$cable.connect(url)' first.`
			);
		}
	}

	perform(channelName, action, data) {
		this._logger.log(
			`Performing action: '${action}' on channel '${channelName}'.`,
			'info'
		);
		const subscription = this._channels.subscriptions[channelName];
		if (subscription) {
			subscription.perform(action, data);
			this._logger.log(
				`Performed: '${action}' on channel '${channelName}'.`,
				'info'
			);
		} else {
			this._logger.log(
				`Could not perform action: '${action}' on channel '${channelName}'.`
			);
		}
	}

	unsubscribe(channelName) {
		this._removeChannel(channelName);
	}

	_channelConnected(channel) {
		if (channel.connected)
			channel.connected.call(this._components[channel._uid]);

		this._logger.log(
			`Successfully connected to channel '${channel._name}'.`,
			'info'
		);
	}

	_channelDisconnected(channel) {
		if (channel.disconnected)
			channel.disconnected.call(this._components[channel._uid]);

		this._logger.log(
			`Successfully disconnected from channel '${channel._name}'.`,
			'info'
		);
	}

	_subscriptionRejected(channel) {
		if (channel.rejected) channel.rejected.call(this._components[channel._uid]);

		this._logger.log(`Subscription rejected for channel '${channel._name}'.`);
	}

	_channelReceived(channel, data) {
		if (channel.received)
			channel.received.call(this._components[channel._uid], data);

		this._logger.log(`Message received on channel '${channel._name}'.`, 'info');
	}

	_addChannel(name, value, component) {
		value._uid = component._uid;
		value._name = name;
		this._channels[name] = value;
		this._addComponent(component);
	}

	_addComponent(component) {
		if (!this._components[component._uid]) {
			this._components[component._uid] = component;
		}
	}

	_removeChannel(name) {
		const uid = this._channels[name]._uid;
		delete this._channels[name];
		this._channels.subscriptions[name].unsubscribe();
		delete this._channels.subscriptions[name];
		delete this._components[uid];
		this._logger.log(`Unsubscribing from channel '${name}'.`, 'info');
	}

	_fireChannelEvent(channelName, callback, data) {
		if (this._channels.hasOwnProperty(channelName)) {
			const channel = this._channels[channelName];
			callback.call(this, channel, data);
		}
	}
}
