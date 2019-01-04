export default class Logger {
	_debug;

	constructor(debug = false) {
		this._debug = debug;
	}

	log(message) {
		if (_debug) {
			console.log(message);
		}
	}
}
