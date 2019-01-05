import Mixin from '../src/mixin';

describe('mixin.js', () => {
	let _addChannel, _removeChannel, context;

	beforeEach(() => {
		_addChannel = jest.fn();
		_removeChannel = jest.fn();
		context = function() {
			this.$options.channels = {
				ChatChannel: {},
				NotificationChannel: {}
			};

			this.$cable = {
				_addChannel,
				_removeChannel
			};
		};
	});

	test('It should correctly retrieve channels when mounted', () => {
		Mixin.mounted.call(context);
		expect(_addChannel).toHaveBeenCalledTimes(2);
	});
});
