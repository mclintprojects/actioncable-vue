import Cable from "./cable";

const ActionCableVue = {
  /**
   * ActionCableVue entry point
   * @param {Object} Vue - Vue instance
   * @param {Object} options - ActionCableVue options
   * @param {string|Function|null} [options.connectionUrl=null] - ActionCable server websocket URL
   * @param {boolean} [options.debug=false] - Enable logging for debug
   * @param {string} [options.debugLevel='all'] - Debug level required for logging. Either `info`, `error`, or `all`
   * @param {boolean} [options.connectImmediately=true] - Connect immediately or wait until the first subscription
   * @param {Object} [options.store=null] - Vuex store
   * @returns {Cable} - Cable instance
   */
  install(Vue, options) {
    const {
      connectionUrl = null,
      debug = false,
      debugLevel = 'all',
      connectImmediately = true,
      store = null
    } = options;

    return new Cable(Vue, {
      connectionUrl,
      debug,
      debugLevel,
      connectImmediately,
      store
    });
  },
};

export default ActionCableVue;
