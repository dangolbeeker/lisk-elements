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

describe.only('api resource module', () => {
	const GET = 'GET';
	const POST = 'POST';
	const defaultBasePath = 'http://localhost:1234';
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
	let liskAPI;
	let apiResource;
	let hasAvailableNodesStub;
	let randomizeNodesStub;
	let banActiveNodeStub;

	beforeEach(() => {
		liskAPI = {
			headers: defaultHeaders,
			fullURL: defaultBasePath,
			hasAvailableNodes: () => {},
			randomizeNodes: () => {},
			banActiveNode: () => {},
		};
		hasAvailableNodesStub = sandbox.stub(liskAPI, 'hasAvailableNodes');
		randomizeNodesStub = sandbox.stub(liskAPI, 'randomizeNodes');
		banActiveNodeStub = sandbox.stub(liskAPI, 'banActiveNode');
		apiResource = new APIResource(liskAPI);
	});

	describe('#constructor', () => {
		it('should throw error if no input is supplid', () => {
			(() => new APIResource()).should.throw('Require LiskAPI instance to be initialized');
		});

		it('should successfully create instance', () => {
			apiResource.should.be.instanceOf(APIResource);
		});
	});

	describe('#getHeaders', () => {
		it('should return liskAPI headers', () => {
			const headers = apiResource.getHeaders();
			headers.should.be.eql(defaultHeaders);
		});
	});

	describe('#getResourcePath', () => {
		it('should return liskAPI basic path', () => {
			const path = apiResource.getResourcePath();
			path.should.be.eql(`${defaultBasePath}/api`);
		});

		it('should return liskAPI path with supplied inputs', () => {
			apiResource.path = defaultResourcePath;
			const path = apiResource.getResourcePath();
			path.should.be.eql(`${defaultBasePath}/api${defaultResourcePath}`);
		});
	});

	describe('#request', () => {
		it('should return liskAPI headers', () => {
		});
	});
});

