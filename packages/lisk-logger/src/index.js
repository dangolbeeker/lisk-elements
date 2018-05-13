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
import fs from 'fs';
import path from 'path';
import winston, { config } from 'winston';

const customLevels = {
	levels: {
		fatal: 0,
		error: 1,
		warn: 2,
		info: 3,
		debug: 4,
		trace: 5,
		none: 99,
	},
	colors: {
		fatal: 'yellow',
		error: 'red',
		warn: 'meganta',
		info: 'blue',
		debug: 'green',
		trace: 'cyan',
		none: 'black',
	},
};

const defaultLoggerConfig = {
	filename: 'logs/lisk.log',
	level: 'none',
	consoleLevel: 'debug',
};

const defualtFormat = options => {
	const header = `${config.colorize(
		options.level,
		options.level.toUpperCase(),
	)} ${options.timestamp()} ${options.message ? options.message : ''}`;
	const info =
		options.meta && Object.keys(options.meta).length
			? `\n\t${JSON.stringify(options.meta)}`
			: '';
	return header.concat(' ', info);
};

const consoleLog = level => ({
	level,
	colorize: true,
	timestamp: () => new Date().toISOString(),
	formatter: defualtFormat,
});

const fileLog = (level, filename) => ({
	level,
	filename,
});

export const createLogger = (
	{ filename, level, consoleLevel } = defaultLoggerConfig,
) => {
	const logger = new winston.Logger({
		levels: customLevels.levels,
		level,
		exitOnError: false,
	});
	if (level !== 'none') {
		// if folder doesn't exist, create one
		const dirPath = path.dirname(filename);
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath);
		}
		logger.add(winston.transports.File, fileLog(level, filename));
	}
	if (consoleLevel !== 'none') {
		logger.add(winston.transports.Console, consoleLog(consoleLevel));
	}
	return logger;
};

const defaultLogger = new winston.Logger({
	exitOnError: false,
	levels: customLevels.levels,
});

export const updateTransports = (
	{ filename, level, consoleLevel } = defaultLoggerConfig,
) => {
	defaultLogger.level = level;
	if (consoleLevel !== 'none' && !defaultLogger.transports.console) {
		defaultLogger.add(winston.transports.Console, consoleLog(consoleLevel));
	}

	if (level !== 'none' && !defaultLogger.transports.file) {
		defaultLogger.add(winston.transports.File, fileLog(level, filename));
	}
};

export default defaultLogger;
