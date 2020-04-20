(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@rails/actioncable')) :
  typeof define === 'function' && define.amd ? define(['@rails/actioncable'], factory) :
  (global = global || self, global.ActionCableVue = factory(global.actioncable));
}(this, (function (actioncable) { 'use strict';

  actioncable = actioncable && Object.prototype.hasOwnProperty.call(actioncable, 'default') ? actioncable['default'] : actioncable;

  class Logger {
    /**
     * Enable logging for debug
     */
    _debug;
    /**
     * Debug level required for logging. Either `info`, `error`, or `all`
     */
    _debugLevel;

    /**
     * ActionCableVue logger entry point
     * @param {boolean} debug - Enable logging for debug
     * @param {string} debugLevel - Debug level required for logging. Either `info`, `error`, or `all`
     */
    constructor(debug, level) {
      this._debug = debug;
      this._debugLevel = level;
    }

    /**
     * Logs a message out to the console
     * @param {string} message - The message to log out to the console
     * @param {string} [level=error] - Debug level required for logging. Either `info`, `error`, or `all`
     */
    log(message, level = "error") {
      if (this._debug) {
        if (this._debugLevel == "all") console.log(message);
        else if (level == this._debugLevel) {
          console.log(message);
        }
      }
    }
  }

  var Mixin = {
    /**
     * Retrieve channels in component once mounted.
     */
    mounted() {
      if (this.$options.channels) {
        Object.entries(this.$options.channels).forEach((entry) => {
          if (entry[0] != "computed")
            this.$cable._addChannel(entry[0], entry[1], this);
          else {
            const computedChannels = entry[1];
            computedChannels.forEach((channel) => {
              const channelName = channel.channelName();
              const channelObject = {
                connected: channel["connected"],
                rejected: channel["rejected"],
                disconnected: channel["disconnected"],
                received: channel["received"],
              };

              this.$options.channels[channelName] = channelObject;
              this.$cable._addChannel(channelName, channelObject, this);
            });
          }
        });
      }
    },
    /**
     * Unsubscribe from channels when component is destroyed.
     */
    destroyed() {
      if (this.$options.channels) {
        Object.keys(this.$options.channels).forEach((key) =>
          this.$cable._removeChannel(key)
        );
      }
    },
  };

  class Cable {
    _logger = null;
    _cable = null;
    _channels = { subscriptions: {} };
    _contexts = {};
    _connectionUrl = null;

    /**
     * ActionCableVue $cable entry point
     * @param {Object} Vue
     * @param {Object} options - ActionCableVue options
     * @param {string} options.connectionUrl - ActionCable server websocket URL
     * @param {boolean} options.debug - Enable logging for debug
     * @param {string} options.debugLevel - Debug level required for logging. Either `info`, `error`, or `all`
     * @param {boolean} options.connectImmediately - Connect immediately or wait until the first subscription.
     */
    constructor(Vue, options) {
      console.log(actioncable);
      Vue.prototype.$cable = this;
      Vue.mixin(Mixin);

      let { debug, debugLevel, connectionUrl, connectImmediately } = options || {
        debug: false,
        debugLevel: "error",
        connectionUrl: null,
      };

      this._connectionUrl = connectionUrl;
      if (connectImmediately !== false) connectImmediately = true;

      this._logger = new Logger(debug, debugLevel);

      if (connectImmediately) this._connect(this._connectionUrl);
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
     * @param {string} url - The websocket URL of the Action Cable server.
     */
    _connect(url) {
      if (typeof url == "string") {
        this._cable = actioncable.createConsumer(url);
      } else if (typeof url == "function") {
        this._cable = actioncable.createConsumer(url());
      } else {
        throw new Error(
          "Connection URL needs to be a valid Action Cable websocket server URL."
        );
      }
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

      this._channels[name] = value;
      this._addContext(context);
    }

    /**
     * Adds a component to a cache. Component is then used to bind `this` in the component channel to the Vue component's execution context
     * @param {Object} context - The Vue component execution context being added
     */
    _addContext(context) {
      if (!this._contexts[context._uid]) {
        this._contexts[context._uid] = { context, users: 1 };
      } else {
        ++this._contexts[context._uid].users;
      }
    }

    /**
     * Component is destroyed. Removes component's channels, subscription and cached execution context.
     */
    _removeChannel(name) {
      if (this._channels.subscriptions[name]) {
        const uid = this._channels[name]._uid;

        this._channels.subscriptions[name].unsubscribe();
        delete this._channels[name];
        delete this._channels.subscriptions[name];

        --this._contexts[uid].users;
        if (this._contexts[uid].users <= 0) delete this._contexts[uid];

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
        const channel = this._channels[channelName];
        callback.call(this, channel, data);
      }
    }
  }

  const ActionCableVue = {
    /**
     * ActionCableVue entry point
     * @param Vue
     * @param {Object} options - ActionCableVue options
     * @param {string} options.connectionUrl - ActionCable server websocket URL
     * @param {boolean} options.debug - Enable logging for debug
     * @param {string} options.debugLevel - Debug level required for logging. Either `info`, `error`, or `all`
     */
    install(Vue, options) {
      new Cable(Vue, options);
    },
  };

  return ActionCableVue;

})));
