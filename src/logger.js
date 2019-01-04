export default class Logger {
	_debug;
	_debugLevel;

	constructor(debug, level) {
		this._debug = debug;
		this._debugLevel = level;
	}

	log(message, level = 'error') {
		if (this._debug) {
			if (this._debugLevel == 'all') console.log(message);
			else if (level == _this._debugLevel) {
				console.log(message);
			}
		}
	}
}
