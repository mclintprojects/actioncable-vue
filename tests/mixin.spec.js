import Mixin from '../src/mixin';

describe('mixin', () => {
	let _addChannel, _removeChannel, context;

	beforeEach(() => {
		_addChannel = jest.fn();
		_removeChannel = jest.fn();

		global.$options = {
			channels: {
				ChatChannel: {},
				NotificationChannel: {}
			}
		};

		global.$cable = {
			_addChannel,
			_removeChannel
		};
	});

	test('It should correctly load channels on mount', () => {
		Mixin.mounted.call(global);
		expect(_addChannel).toBeCalledTimes(
			Object.keys(global.$options.channels).length
		);
	});

	test('It should correctly unsubscribe from channels on destroy', () => {
		Mixin.destroyed.call(global);
		expect(_removeChannel).toBeCalledTimes(
			Object.keys(global.$options.channels).length
		);
	});
});
