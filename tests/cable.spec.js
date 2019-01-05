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
		global._logger = { log() {} };

		cable.perform.call(global, whatToDo);
		expect(perform).toHaveBeenCalledWith(whatToDo.action, whatToDo.data);
	});
});
