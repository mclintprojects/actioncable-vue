/**
 * @typedef {'info' | 'error' | 'all'} LogLevel
 */

export default class Logger {
  /** @type {boolean} */
  _debug;

  /** @type {LogLevel} */
  _debugLevel;

  /**
   * ActionCableVue logger entry point
   * @param {boolean} debug - Enable logging for debug
   * @param {LogLevel} level - Debug level required for logging
   */
  constructor(debug, level = 'error') {
    this._debug = debug;
    this._debugLevel = level;
  }

  /**
   * Logs a message out to the console
   * @param {string} message - The message to log out to the console
   * @param {LogLevel} [level='error'] - Debug level for this message
   */
  log(message, level = 'error') {
    if (this._debug && (this._debugLevel === 'all' || level === this._debugLevel)) {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }
}
