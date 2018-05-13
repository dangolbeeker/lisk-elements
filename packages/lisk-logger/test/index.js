/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
import logger, { createLogger, updateTransports } from '../src';
// required for stubbing
const fs = require('fs');

describe('lisk-logger', () => {
	beforeEach(() => {
		sandbox.stub(fs, 'existsSync');
		sandbox.stub(fs, 'mkdirSync');
		return Promise.resolve();
	});

	describe('logger', () => {
		it('should return logger', () => {
			return expect(logger).to.be.an('object');
		});

		it('should have error function', () => {
			return expect(logger.error).to.be.a('function');
		});
	});

	describe('#createLogger', () => {
		it('should be a function', () => {
			return expect(createLogger).to.be.a('function');
		});

		it('should use default value', () => {
			const newLogger = createLogger();
			return expect(newLogger.level).to.equal('none');
		});

		it('should not call existsSync with level none', () => {
			createLogger({ level: 'none' });
			return expect(fs.existsSync).not.to.be.called;
		});

		it('should call existsSync with level not none', () => {
			createLogger({ level: 'info', filename: 'logs/sample.log' });
			return expect(fs.existsSync).to.be.called;
		});

		it('should call mkdirSync with level not none', () => {
			createLogger({
				level: 'info',
				filename: 'logs/main/sample.log',
				consoleLevel: 'none',
			});
			return expect(fs.mkdirSync).to.be.calledWithExactly('logs/main');
		});

		describe('when console level is not set to none', () => {
			let newLogger;
			before(() => {
				newLogger = createLogger({
					consoleLevel: 'debug',
					level: 'error',
					filename: 'logs/sample.log',
				});
				return Promise.resolve();
			});

			it('it should call stringify for the metadata', () => {
				newLogger.debug('new data', { key: 'app' });
				// FIXME: need to test the result
				return Promise.resolve();
			});

			it('it should replace message with empty string', () => {
				newLogger.debug();
				// FIXME: need to test the result
				return Promise.resolve();
			});
		});
	});

	describe('#updateTransports', () => {
		beforeEach(() => {
			require.cache = {};
			return Promise.resolve();
		});

		it('should call with default value', () => {
			updateTransports();
			return expect(logger.level).to.equal('none');
		});

		it('should add console transport', () => {
			updateTransports({ consoleLevel: 'debug', level: 'none' });
			return expect(logger.transports).to.have.key('console');
		});

		it('should add file transport', () => {
			updateTransports({
				consoleLevel: 'none',
				level: 'info',
				filename: 'logs/info.log',
			});
			return expect(logger.transports).to.have.property('file');
		});
	});
});
