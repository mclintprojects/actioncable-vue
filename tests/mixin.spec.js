import Mixin from '../src/mixin';

describe('Mixin', () => {
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

	test('It should not load channels on mount if component does not have channels object defined', () => {
		global.$options = {};
		Mixin.mounted.call(global);
		expect(_addChannel).toBeCalledTimes(0);
	});

	test('It should correctly unsubscribe from channels on destroy', () => {
		Mixin.destroyed.call(global);
		expect(_removeChannel).toBeCalledTimes(
			Object.keys(global.$options.channels).length
		);
	});

	test('It should not attempt to remove channels on destroy if component does not have channels object defined', () => {
		global.$options = {};
		Mixin.destroyed.call(global);
		expect(_removeChannel).toBeCalledTimes(0);
	});
});
