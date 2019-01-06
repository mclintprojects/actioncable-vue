import Logger from '../src/logger';

describe('Logger', () => {
	let log;

	beforeEach(() => {
		log = jest.fn();
		console.log = log;
	});

	test('It should correctly log if debugLevel is all', () => {
		const logger = new Logger(true, 'all');

		logger.log('Hi -- info', 'info');
		expect(log).toBeCalledWith('Hi -- info');

		logger.log('Hi -- error', 'error');
		expect(log).toBeCalledWith('Hi -- error');
	});

	test('It should correctly log if debugLevel is info', () => {
		const logger = new Logger(true, 'info');
		logger.log('Hi -- info', 'info');
		expect(log).toBeCalledWith('Hi -- info');
	});

	test('It should correctly log if debugLevel is error', () => {
		const logger = new Logger(true, 'error');
		logger.log('Hi -- error', 'error');
		expect(log).toBeCalledWith('Hi -- error');
	});

	test('It should not log if debugLevel does not match error type', () => {
		const logger = new Logger(true, 'info');
		logger.log('Hi -- error', 'error');
		expect(log).toBeCalledTimes(0);
	});

	test('It should not log if debug is set to false', () => {
		const logger = new Logger(false, 'error');
		logger.log('Hi -- error', 'error');
		expect(log).toBeCalledTimes(0);
	});

	test('It should log messages as error by default', () => {
		const logger = new Logger(true, 'error');
		logger.log('Hi -- error');
		expect(log).toBeCalledTimes(1);
		expect(log).toHaveBeenCalledWith('Hi -- error');
	});
});
