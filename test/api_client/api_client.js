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
import APIClient, { getMainnetClient, getTestnetClient } from 'api_client/api_client';

describe.only('APIClient module', () => {
	const mainnetHash =
		'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511';
	const testnetHash =
		'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba';
	const defaultHeaders = {
		'Content-Type': 'application/json',
		nethash: mainnetHash,
		os: 'lisk-js-api',
		version: '1.0.0',
		minVersion: '>=1.0.0',
	};

	const customHeaders = {
		'Content-Type': 'application/json',
		nethash: testnetHash,
		os: 'lisk-js-api',
		version: '0.5.0',
		minVersion: '>=1.0.0',
	};

	const localNode = 'http://localhost:7000';
	const externalNode = 'https://googIe.com:8080';
	const sslNode = 'https://external.lisk.io:443';
	const externalTestnetNode = 'http://testnet.lisk.io';
	const defaultNodes = [localNode, externalNode, sslNode];
	const defaultBannedNodes = ['naughty1', 'naughty2', 'naughty3'];
	const defaultSelectedNode = 'selected_node';
	const defaultUrl = 'node.url.com';

	let apiClient;

	beforeEach(() => {
		apiClient = new APIClient(defaultNodes, mainnetHash);
	});

	describe('#constructor', () => {
		it('should throw an error if no arguments are passed to constructor', () => {
			return (() => new APIClient()).should.throw(Error, 'Require nodes to be initialized.');
		});

		it('should throw an error if first argument passed to constructor is not array', () => {
			return (() => new APIClient('non-array')).should.throw(Error, 'Require nodes to be initialized.');
		});

		it('should throw an error if first argument passed to constructor is empty array', () => {
			return (() => new APIClient([])).should.throw(Error, 'Require nodes to be initialized.');
		});

		it('should throw an error if no second argument is passed to constructor', () => {
			return (() => new APIClient(defaultNodes)).should.throw(Error, 'Require nethash to be initialized.');
		});

		it('should throw an error if second argument is passed to constructor is not string', () => {
			return (() => new APIClient(defaultNodes, 123)).should.throw(Error, 'Require nethash to be initialized.');
		});

		it('should throw an error if second argument is passed to constructor is empty string', () => {
			return (() => new APIClient(defaultNodes, '')).should.throw(Error, 'Require nethash to be initialized.');
		});

		it('should throw an error if second argument is passed to constructor is empty string', () => {
			return (() => new APIClient(defaultNodes, '')).should.throw(Error, 'Require nethash to be initialized.');
		});

		it('should create a new instance of APIClient', () => {
			return apiClient.should.be.an('object').and.be.instanceof(APIClient);
		});

		describe('headers', () => {
			it('should set with passed nethash, with default options', () => {
				return apiClient.should.have.property('headers').and.eql(defaultHeaders);
			});

			it('should set custom headers with supplied options', () => {
				apiClient = new APIClient(defaultNodes, testnetHash, {
					version: '0.5.0',
					minVersion: '>=0.1.0',
				});
				return apiClient.should.have.property('headers').and.eql(customHeaders);
			});
		});

		describe('randomizeNodes', () => {
			it('should set randomizeNodes to true when randomizeNodes not explicitly set', () => {
				apiClient = new APIClient(defaultNodes, mainnetHash, { randomizeNodes: undefined });
				return apiClient.should.have.property('randomizeNodes').be.true;
			});

			it('should set randomizeNodes to true on initialization when passed as an option', () => {
				apiClient = new APIClient(defaultNodes, mainnetHash, { randomizeNodes: true });
				return apiClient.should.have.property('randomizeNodes').be.true;
			});

			it('should set randomizeNodes to false on initialization when passed as an option', () => {
				apiClient = new APIClient(defaultNodes, mainnetHash, { randomizeNodes: false });
				return apiClient.should.have.property('randomizeNodes').be.false;
			});
		});

		describe('nodes', () => {
			it('should set all nodes lists to provided nodes on initialization when passed as an option', () => {
				apiClient = new APIClient({ nodes: defaultNodes });
				return apiClient.should.have.property('currentNodes').be.eql(defaultNodes);
			});

			it('should set all bannedNodes list to provided bannedNodes on initialization when passed as an option', () => {
				apiClient = new APIClient({ bannedNodes: defaultBannedNodes });
				return defaultBannedNodes.every(
					node => apiClient.isBanned(node).should.be.true,
				);
			});

			it('should set node to provided node on initialization when passed as an option', () => {
				apiClient = new APIClient({ node: defaultUrl });
				return apiClient.should.have.property('node').be.equal(defaultUrl);
			});
		});

		describe('bannedNodes', () => {
			it('should set empty array if no option is passed', () => {
				apiClient = new APIClient({ bannedNodes: undefined });
				return apiClient.should.have.property('bannedNodes').be.eql([]);
			});

			it('should set bannedNodes when passed as an option', () => {
				const bannedNodes = ['a', 'b'];
				apiClient = new APIClient({ bannedNodes });
				return apiClient.should.have.property('bannedNodes').be.eql(bannedNodes);
			});
		});
	});

	describe('get nodeFullURL', () => {
		it('should return with set port', () => {
			apiClient = new APIClient({ port: '8080', node: localNode });
			return apiClient.nodeFullURL.should.be.equal('https://localhost:8080');
		});

		it('should not include port in the URL if port is not set', () => {
			apiClient = new APIClient({ port: '', node: localNode });
			return apiClient.nodeFullURL.should.be.equal('https://localhost');
		});
	});

	describe('#isBanned', () => {
		it('should return true when provided node is banned', () => {
			apiClient = new APIClient({ bannedNodes: [localNode] });
			return apiClient.isBanned(localNode).should.be.true;
		});

		it('should return false when provided node is not banned', () => {
			return apiClient.isBanned(localNode).should.be.false;
		});
	});

	describe('get randomNode', () => {
		let nodesStub;

		beforeEach(() => {
			apiClient = new APIClient();
			nodesStub = sandbox.stub(apiClient, 'currentNodes');
			nodesStub.get(() => [...defaultNodes]);
		});

		it('should throw an error if all relevant nodes are banned', () => {
			apiClient.bannedNodes = [...defaultNodes];
			return apiClient.getRandomNode
				.bind(apiClient)
				.should.throw(
					'Cannot get random node: all relevant nodes have been banned.',
				);
		});

		it('should return a node', () => {
			const result = apiClient.getRandomNode();
			return defaultNodes.should.contain(result);
		});

		it('should randomly select the node', () => {
			const firstResult = apiClient.getRandomNode();
			let nextResult = apiClient.getRandomNode();
			// Test will almost certainly time out if not random
			while (nextResult === firstResult) {
				nextResult = apiClient.getRandomNode();
			}
		});
	});

	describe('#selectNewNode', () => {
		const customNode = 'customNode';
		const getRandomNodeResult = externalNode;

		beforeEach(() => {
			sandbox.stub(apiClient, 'getRandomNode').returns(getRandomNodeResult);
		});

		describe('if a node was provided in the options', () => {
			beforeEach(() => {
				apiClient.providedNode = customNode;
			});
			describe('if randomizeNodes is set to false', () => {
				beforeEach(() => {
					apiClient.randomizeNodes = false;
				});

				it('should throw an error if the provided node is banned', () => {
					apiClient.bannedNodes = [customNode];
					return apiClient.selectNewNode
						.bind(apiClient)
						.should.throw(
							'Cannot select node: provided node has been banned and randomizeNodes is not set to true.',
						);
				});

				it('should return the provided node if it is not banned', () => {
					const result = apiClient.selectNewNode();
					return result.should.be.equal(customNode);
				});
			});

			describe('if randomizeNodes is set to true', () => {
				beforeEach(() => {
					apiClient.randomizeNodes = true;
				});

				it('should return a random node', () => {
					const result = apiClient.selectNewNode();
					return result.should.be.equal(getRandomNodeResult);
				});
			});
		});

		describe('if a node was not provided in the options', () => {
			beforeEach(() => {
				apiClient.providedNode = null;
			});

			describe('if randomizeNodes is set to false', () => {
				beforeEach(() => {
					apiClient.randomizeNodes = false;
				});

				it('should throw an error', () => {
					return apiClient.selectNewNode
						.bind(apiClient)
						.should.throw(
							'Cannot select node: no node provided and randomizeNodes is not set to true.',
						);
				});
			});

			describe('if randomizeNodes is set to true', () => {
				beforeEach(() => {
					apiClient.randomizeNodes = true;
				});

				it('should return a random node', () => {
					const result = apiClient.selectNewNode();
					return result.should.be.equal(getRandomNodeResult);
				});
			});
		});
	});

	describe('#banActiveNode', () => {
		let node;

		beforeEach(() => {
			node = apiClient.node;
		});

		it('should add current node to banned nodes', () => {
			apiClient.banActiveNode();
			return apiClient.isBanned(node).should.be.true;
		});

		it('should not duplicate a banned node', () => {
			const bannedNodes = [node];
			apiClient.bannedNodes = bannedNodes;
			apiClient.banActiveNode();

			return apiClient.bannedNodes.should.be.eql(bannedNodes);
		});
	});

	describe('#banActiveNodeAndSelect', () => {
		let node;
		let selectNewNodeStub;

		beforeEach(() => {
			node = apiClient.node;
			selectNewNodeStub = sandbox
				.stub(apiClient, 'selectNewNode')
				.returns(defaultSelectedNode);
		});

		it('should call ban current node', () => {
			apiClient.banActiveNodeAndSelect();
			return apiClient.isBanned(node).should.be.true;
		});

		it('should call selectNewNode when the node is banned', () => {
			apiClient.banActiveNodeAndSelect();
			return selectNewNodeStub.should.be.calledOnce;
		});

		it('should not call selectNewNode when the node is not banned', () => {
			const bannedNodes = [node];
			apiClient.bannedNodes = bannedNodes;
			apiClient.banActiveNodeAndSelect();
			return selectNewNodeStub.should.not.be.called;
		});
	});

	describe('#hasAvailableNodes', () => {
		let nodesStub;

		beforeEach(() => {
			nodesStub = sandbox.stub(apiClient, 'currentNodes');
			nodesStub.get(() => [...defaultNodes]);
		});

		describe('with randomized nodes', () => {
			beforeEach(() => {
				apiClient.randomizeNodes = true;
			});

			it('should return false without nodes left', () => {
				nodesStub.get(() => []);
				const result = apiClient.hasAvailableNodes();
				return result.should.be.false;
			});

			it('should return true with contents', () => {
				nodesStub.get(() => ['nodeA']);
				const result = apiClient.hasAvailableNodes();
				return result.should.be.true;
			});
		});

		describe('without randomized nodes', () => {
			beforeEach(() => {
				apiClient.randomizeNodes = false;
			});

			it('should return false', () => {
				const result = apiClient.hasAvailableNodes();
				return result.should.be.false;
			});
		});
	});
});
