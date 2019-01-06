import Cable from '../src/cable';

describe('Cable', () => {
	let cable, vue, create;

	beforeEach(() => {
		vue = function() {};
		vue.mixin = jest.fn();
		create = jest.fn();

		cable = new Cable(vue, { connectionUrl: 'ws://localhost:5000/api/cable' });

		global._cable = {
			subscriptions: {
				create
			}
		};
		global._channels = {
			subscriptions: {}
		};
		global._logger = { log() {} };
		global._contexts = {};
	});

	test('It should initialize correctly if options provided', () => {
		cable = new Cable(vue, {
			connectionUrl: 'ws://localhost:5000/api/cable',
			debug: true,
			debugLevel: 'error'
		});

		expect(vue.prototype.$cable).toBeDefined();
		expect(vue.mixin).toHaveBeenCalled();
		expect(cable._logger._debug).toBe(true);
		expect(cable._logger._debugLevel).toBe('error');
	});

	test('It should correctly subscribe to channel', () => {
		create.mockReturnValue({});
		cable.subscribe.call(global, { channel: 'ChatChannel' });
		expect(global._cable.subscriptions.create).toBeCalled();
		expect(global._channels.subscriptions['ChatChannel']).toBeDefined();
	});

	test('It should correctly subscribe to channel with custom name', () => {
		create.mockReturnValue({});
		cable.subscribe.call(
			global,
			{ channel: 'ChatChannel' },
			'custom_channel_name'
		);
		expect(global._cable.subscriptions.create).toBeCalled();
		expect(global._channels.subscriptions['custom_channel_name']).toBeDefined();
	});

	test('It should correctly subscribe to same channel with multiple custom names', () => {
		create.mockReturnValue({});
		cable.subscribe.call(
			global,
			{ channel: 'ChatChannel' },
			'custom_channel_name'
		);
		cable.subscribe.call(
			global,
			{ channel: 'ChatChannel' },
			'custom_channel_name_2'
		);

		expect(global._cable.subscriptions.create).toBeCalledTimes(2);
		expect(global._channels.subscriptions['custom_channel_name']).toBeDefined();
		expect(
			global._channels.subscriptions['custom_channel_name_2']
		).toBeDefined();
	});

	test('It should correctly perform an action on a channel', () => {
		const perform = jest.fn();
		const whatToDo = {
			channel: 'ChatChannel',
			action: 'send_message',
			data: { content: 'Hi' }
		};
		global._channels.subscriptions.ChatChannel = {
			perform
		};

		cable.perform.call(global, whatToDo);
		expect(perform).toHaveBeenCalledWith(whatToDo.action, whatToDo.data);
	});

	test('It should correctly fire connected event', () => {
		const connected = jest.fn();
		const channel = { _uid: 0, name: 'ChatChannel', connected };
		global._channels.ChatChannel = channel;
		global._contexts[0] = { context: this };

		cable._fireChannelEvent.call(
			global,
			'ChatChannel',
			cable._channelConnected
		);

		expect(connected).toBeCalledTimes(1);
	});

	test('It should correctly fire rejected event', () => {
		const rejected = jest.fn();
		const channel = { _uid: 1, name: 'ChatChannel', rejected };
		global._channels.ChatChannel = channel;
		global._contexts[1] = { context: this };

		cable._fireChannelEvent.call(
			global,
			'ChatChannel',
			cable._subscriptionRejected
		);

		expect(rejected).toBeCalledTimes(1);
	});

	test('It should correctly fire disconnected event', () => {
		const disconnected = jest.fn();
		const channel = { _uid: 2, name: 'ChatChannel', disconnected };
		global._channels.ChatChannel = channel;
		global._contexts[2] = { context: this };

		cable._fireChannelEvent.call(
			global,
			'ChatChannel',
			cable._channelDisconnected
		);

		expect(disconnected).toBeCalledTimes(1);
	});

	test('It should correctly fire received event', () => {
		const received = jest.fn();
		const data = { age: 1 };
		const channel = { _uid: 3, name: 'ChatChannel', received };
		global._channels.ChatChannel = channel;
		global._contexts[3] = { context: this };

		cable._fireChannelEvent.call(
			global,
			'ChatChannel',
			cable._channelReceived,
			data
		);

		expect(received).toBeCalledTimes(1);
		expect(received).toHaveBeenCalledWith(data);
	});
});
