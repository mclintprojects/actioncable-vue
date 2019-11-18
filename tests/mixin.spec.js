import Mixin from '../src/mixin';

describe('Mixin', () => {
	let _addChannel,
		_removeChannel,
		userId = 1;

	beforeEach(() => {
		_addChannel = jest.fn();
		_removeChannel = jest.fn();

		global.$options = {
			channels: {
				ChatChannel: {},
				NotificationChannel: {},
				dynamic: [
					{
						channelName() {
							return `${userId}_channel`;
						},
						connected() {},
						rejected() {},
						disconnected() {},
						received(data) {
							return `${data} was passed in`;
						}
					}
				]
			}
		};

		global.$cable = {
			_addChannel,
			_removeChannel
		};
	});

	test('It should correctly load channels on mount', () => {
		Mixin.mounted.call(global);
		expect(_addChannel).toBeCalledTimes(3);
		expect(global.$options.channels[`${userId}_channel`]).toBeDefined();
		expect(
			global.$options.channels[`${userId}_channel`].connected
		).toBeDefined();
		expect(
			global.$options.channels[`${userId}_channel`].rejected
		).toBeDefined();
		expect(
			global.$options.channels[`${userId}_channel`].received
		).toBeDefined();
		expect(
			global.$options.channels[`${userId}_channel`].disconnected
		).toBeDefined();
		expect(global.$options.channels[`${userId}_channel`].received('2')).toEqual(
			'2 was passed in'
		);
	});

	test('It should not load channels on mount if component does not have channels object defined', () => {
		global.$options = {};
		Mixin.mounted.call(global);
		expect(_addChannel).toBeCalledTimes(0);
	});

	test('It should correctly unsubscribe from channels on destroy', () => {
		Mixin.destroyed.call(global);
		expect(_removeChannel).toBeCalledTimes(3);
	});

	test('It should not attempt to remove channels on destroy if component does not have channels object defined', () => {
		global.$options = {};
		Mixin.destroyed.call(global);
		expect(_removeChannel).toBeCalledTimes(0);
	});
});
