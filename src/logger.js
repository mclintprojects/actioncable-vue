export default class Logger {
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
      if (this._debugLevel === "all") console.log(message);
      else if (level === this._debugLevel) {
        console.log(message);
      }
    }
  }
}
