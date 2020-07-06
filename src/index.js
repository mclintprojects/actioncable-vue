import Cable from "./cable";

const ActionCableVue = {
  /**
   * ActionCableVue entry point
   * @param Vue
   * @param {Object} options - ActionCableVue options
   * @param {string|Function|null} [options.connectionUrl=null] - ActionCable server websocket URL
   * @param {boolean} options.debug - Enable logging for debug
   * @param {string} options.debugLevel - Debug level required for logging. Either `info`, `error`, or `all`
   * @param {boolean} options.connectImmediately - Connect immediately or wait until the first subscription
   * @param {object} options.store - Vuex store
   */
  install(Vue, options) {
    new Cable(Vue, options);
  },
};
export default ActionCableVue;
