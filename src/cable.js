import { createConsumer } from "@rails/actioncable";
import Logger from "./logger";
import Mixin from "./mixin";

export default class Cable {
  _logger = null;
  _cable = null;
  _channels = { subscriptions: {} };
  _contexts = {};
  _connectionUrl = null;

  /**
   * ActionCableVue $cable entry point
   * @param {Object} Vue
   * @param {Object} options - ActionCableVue options
   * @param {string|Function|null} [options.connectionUrl=null] - ActionCable server websocket URL
   * @param {boolean} options.debug - Enable logging for debug
   * @param {string} options.debugLevel - Debug level required for logging. Either `info`, `error`, or `all`
   * @param {boolean} options.connectImmediately - Connect immediately or wait until the first subscription
   * @param {object} options.store - Vuex store
   */
  constructor(Vue, options) {
    const VERSION = Number(Vue.version.split(".")[0]);

	  if (VERSION === 3) {
		  Vue.config.globalProperties.$cable = this;
	  } else {
		  Vue.prototype.$cable = this;
	  }

	  Vue.mixin(Mixin);

    let {
      debug,
      debugLevel,
      connectionUrl,
      connectImmediately,
      store,
    } = options || {
      debug: false,
      debugLevel: "error",
      connectionUrl: null,
      store: null,
    };

    this._connectionUrl = connectionUrl;
    if (connectImmediately !== false) connectImmediately = true;

    if (store) {
      store.$cable = this;
    }

    this._logger = new Logger(debug, debugLevel);

    if (connectImmediately) this._connect(this._connectionUrl);

    this._attachConnectionObject();
  }

  /**
   * Subscribes to an Action Cable server channel
   * @param {Object} subscription
   * @param {string} subscription.channel - The name of the Action Cable server channel
   * @param {string} subscription.room - The room in the Action Cable server channel to subscribe to
   * @param {string} name - A custom channel name to be used in component
   */
  subscribe(subscription, name) {
    if (this._cable) {
      const channelName = name || subscription.channel;

      this._channels.subscriptions[
        channelName
      ] = this._cable.subscriptions.create(subscription, {
        connected: () => {
          this._fireChannelEvent(channelName, this._channelConnected);
        },
        disconnected: () => {
          this._fireChannelEvent(channelName, this._channelDisconnected);
        },
        rejected: () => {
          this._fireChannelEvent(channelName, this._subscriptionRejected);
        },
        received: (data) => {
          this._fireChannelEvent(channelName, this._channelReceived, data);
        },
      });
    } else {
      this._connect(this._connectionUrl);
      this.subscribe(subscription, name);
    }
  }

  /**
   * Perform an action in an Action Cable server channel
   * @param {Object} whatToDo
   * @param {string} whatToDo.channel - The name of the Action Cable server channel / The custom name chosen for the component channel
   * @param {string} whatToDo.action - The action to call in the Action Cable server channel
   * @param {Object} whatToDo.data - The data to pass along with the call to the action
   */
  perform(whatToDo) {
    const { channel, action, data } = whatToDo;
    this._logger.log(
      `Performing action '${action}' on channel '${channel}'.`,
      "info"
    );
    const subscription = this._channels.subscriptions[channel];
    if (subscription) {
      subscription.perform(action, data);
      this._logger.log(
        `Performed '${action}' on channel '${channel}'.`,
        "info"
      );
    } else {
      throw new Error(
        `You need to be subscribed to perform action '${action}' on channel '${channel}'.`
      );
    }
  }

  /**
   * Unsubscribes from an Action Cable server channel
   * @param {string} channelName - The name of the Action Cable server channel / The custom name chosen for the component channel
   */
  unsubscribe(channelName) {
    if (this._channels.subscriptions[channelName]) {
      this._channels.subscriptions[channelName].unsubscribe();
      this._logger.log(`Unsubscribed from channel '${channelName}'.`, "info");
    }
  }

  /**
   * Called when a subscription to an Action Cable server channel successfully completes. Calls connected on the component channel
   * @param {Object} channel - The component channel
   */
  _channelConnected(channel) {
    if (channel.connected)
      channel.connected.call(this._contexts[channel._uid].context);

    this._logger.log(
      `Successfully connected to channel '${channel._name}'.`,
      "info"
    );
  }

  /**
   * Called when a subscription to an Action Cable server channel disconnects. Calls disconnected on the component channel
   * @param {Object} channel - The component channel
   */
  _channelDisconnected(channel) {
    if (channel.disconnected)
      channel.disconnected.call(this._contexts[channel._uid].context);

    this._logger.log(
      `Successfully disconnected from channel '${channel._name}'.`,
      "info"
    );
  }

  /**
   * Called when a subscription to an Action Cable server channel is rejected by the server. Calls rejected on the component channel
   * @param {Object} channel - The component channel
   */
  _subscriptionRejected(channel) {
    if (channel.rejected)
      channel.rejected.call(this._contexts[channel._uid].context);

    this._logger.log(`Subscription rejected for channel '${channel._name}'.`);
  }

  /**
   * Called when a message from an Action Cable server channel is received. Calls received on the component channel
   * @param {Object} channel - The component channel
   */
  _channelReceived(channel, data) {
    if (channel.received)
      channel.received.call(this._contexts[channel._uid].context, data);

    this._logger.log(`Message received on channel '${channel._name}'.`, "info");
  }

  /**
   * Connects to an Action Cable server
   * @param {string|Function|null} url - The websocket URL of the Action Cable server.
   */
  _connect(url) {
    if (typeof url == "function") {
      this._cable = createConsumer(url());
    } else {
      this._cable = createConsumer(url);
    }
  }

  _attachConnectionObject() {
    this.connection = {
      /**
       * Manually connect to an Action Cable server. Automatically re-subscribes all your subscriptions.
       * @param {String|Function|null} [url=null] - Optional parameter. The connection URL to your Action Cable server
       */
      connect: (url = null) => {
        if (this._cable) {
          this._cable.connect();
        } else {
          if (url) this._connectionUrl = url;
          this._connect(url || this._connectionUrl);
        }
      },
      /**
       * Disconnect from your Action Cable server
       */
      disconnect: () => {
        if (this._cable) this._cable.disconnect();
      },
    };
  }

  /**
   * Component mounted. Retrieves component channels for later use
   * @param {string} name - Component channel name
   * @param {Object} value - The component channel object itself
   * @param {Object} context - The execution context of the component the channel was created in
   */
  _addChannel(name, value, context) {
    value._uid = context._uid;
    value._name = name;

    if (!this._channels[name]) this._channels[name] = [];
    this._addContext(context);

    if (!this._channels[name].find(c => c._uid == context._uid) && this._contexts[context._uid]) {
      this._channels[name].push(value);
    }
  }

  /**
   * Adds a component to a cache. Component is then used to bind `this` in the component channel to the Vue component's execution context
   * @param {Object} context - The Vue component execution context being added
   */
  _addContext(context) {
    this._contexts[context._uid] = { context };
  }

  /**
   * Component is destroyed. Removes component's channels, subscription and cached execution context.
   */
  _removeChannel(name, uid) {
    if (this._channels[name]) {
      this._channels[name].splice(this._channels[name].findIndex(c => c._uid == uid), 1);
      delete this._contexts[uid];

      if (this._channels[name].length == 0 && this._channels.subscriptions[name]) {
        this._channels.subscriptions[name].unsubscribe();
        delete this._channels.subscriptions[name];
      }

      this._logger.log(`Unsubscribed from channel '${name}'.`, "info");
    }
  }

  /**
   * Fires the event triggered by the Action Cable subscription on the component channel
   * @param {string} channelName - The name of the Action Cable server channel / The custom name chosen for the component channel
   * @param {Function} callback - The component channel event to call
   * @param {Object} data - The data passed from the Action Cable server channel
   */
  _fireChannelEvent(channelName, callback, data) {
    if (this._channels.hasOwnProperty(channelName)) {
      const channelEntries = this._channels[channelName];
      for (let i = 0; i < channelEntries.length; i++) {
        callback.call(this, channelEntries[i], data);
      }
    }
  }
}
