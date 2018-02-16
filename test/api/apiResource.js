/*
 * Copyright © 2017 Lisk Foundation
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

import APIResource from 'api/apiResource';

describe('api resource module', () => {
	const GET = 'GET';
	const POST = 'POST';
	const defaultBasePath = 'http://localhost:1234/api';
	const defaultResourcePath = '/resources';
	const defaultFullPath = `${defaultBasePath}${defaultResourcePath}`;
	const errorArgumentNumber = Error('Arguments must include Params defined.');
	const defaultHeaders = {
		'Content-Type': 'application/json',
		nethash: 'mainnetHash',
		os: 'lisk-js-api',
		version: '1.0.0',
		minVersion: '>=0.5.0',
		port: '443',
	};
	let LiskAPI;
	let hasAvailableNodesStub;
	let randomizeNodesStub;
	let banActiveNodeStub;

	beforeEach(() => {
		LiskAPI = {
			headers: defaultHeaders,
			fullURL: defaultBasePath,
			hasAvailableNodes: () => {},
			randomizeNodes: () => {},
			banActiveNode: () => {},
		};
	});

	describe('#constructor', () => {
	});
});

