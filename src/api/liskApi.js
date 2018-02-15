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
import {
	LIVE_PORT,
	SSL_PORT,
	TEST_PORT,
	TESTNET_NETHASH,
	MAINNET_NETHASH,
} from 'constants';
import config from '../../config.json';
import { get, post } from './httpClient';

const commonHeaders = {
	'Content-Type': 'application/json',
	os: 'lisk-js-api',
	version: '1.0.0',
	minVersion: '>=0.5.0',
	Accept: 'application/json',
};

export default class LiskAPI {
	constructor(providedOptions) {
		const options = Object.assign({}, config.options, providedOptions);
		this.ssl = options.ssl !== undefined ? options.ssl : true;
		this.testnet = options.testnet || false;
		const nethash =
			options.headers && options.headers.nethash
				? options.headers.nethash
				: null;
		this.headers = this.getDefaultHeaders(nethash);

		this.defaultNodes = [...(options.nodes || config.nodes.mainnet)];
		this.defaultTestnetNodes = [...(options.nodes || config.nodes.testnet)];
		this.bannedNodes = [...(options.bannedNodes || [])];

		this.port =
			options.port === '' || options.port
				? options.port
				: this.getDefaultPort();
		this.randomizeNodes =
			options.randomizeNodes !== undefined ? options.randomizeNodes : true;
		this.providedNode = options.node || null;
		this.node = options.node || this.selectNewNode();
	}

	get allNodes() {
		return {
			current: this.node,
			default: this.defaultNodes,
			testnet: this.defaultTestnetNodes,
		};
	}

	get nodes() {
		if (this.testnet) {
			return this.defaultTestnetNodes;
		}
		return this.defaultNodes;
	}

	get urlPrefix() {
		if (this.ssl) {
			return 'https';
		}
		return 'http';
	}

	get fullURL() {
		const nodeUrl = this.port ? `${this.node}:${this.port}` : this.node;
		return `${this.urlPrefix}://${nodeUrl}`;
	}

	getDefaultHeaders(providedNethash) {
		const headers = Object.assign({}, commonHeaders, {
			port: this.port,
			nethash: this.testnet ? TESTNET_NETHASH : MAINNET_NETHASH,
		});
		if (providedNethash) {
			headers.nethash = providedNethash;
			headers.version = '0.0.0a';
		}
		return headers;
	}

	getDefaultPort() {
		if (this.testnet) {
			return TEST_PORT;
		}
		if (this.ssl) {
			return SSL_PORT;
		}
		return LIVE_PORT;
	}

	getRandomNode() {
		const nodes = this.nodes.filter(node => !this.isBanned(node));

		if (!nodes.length || nodes.length === 0) {
			throw new Error(
				'Cannot get random node: all relevant nodes have been banned.',
			);
		}

		const randomIndex = Math.floor(Math.random() * nodes.length);
		return nodes[randomIndex];
	}

	setSSL(newSSLValue) {
		if (this.ssl !== newSSLValue) {
			const nonSSLPort = this.testnet ? TEST_PORT : LIVE_PORT;

			this.ssl = newSSLValue;
			this.port = newSSLValue ? SSL_PORT : nonSSLPort;
			this.bannedNodes = [];

			this.selectNewNode();
		}
	}

	setTestnet(newTestnetValue) {
		if (this.testnet !== newTestnetValue) {
			const nonTestnetPort = this.ssl ? SSL_PORT : LIVE_PORT;

			this.testnet = newTestnetValue;
			this.port = newTestnetValue ? TEST_PORT : nonTestnetPort;
			this.bannedNodes = [];

			this.selectNewNode();
		}
	}

	banActiveNode() {
		if (!this.isBanned(this.node)) {
			this.bannedNodes.push(this.node);
			this.node = this.selectNewNode();
			return true;
		}
		return false;
	}

	banActiveNodeAndSelect() {
		if (!this.isBanned(this.node)) {
			this.bannedNodes.push(this.node);
			this.node = this.selectNewNode();
			return true;
		}
		return false;
	}

	hasAvailableNodes() {
		return this.randomizeNodes
			? this.nodes.some(node => !this.isBanned(node))
			: false;
	}

	isBanned(node) {
		return this.bannedNodes.includes(node);
	}

	selectNewNode() {
		if (this.randomizeNodes) {
			return this.getRandomNode();
		} else if (this.providedNode) {
			if (this.isBanned(this.providedNode)) {
				throw new Error(
					'Cannot select node: provided node has been banned and randomizeNodes is not set to true.',
				);
			}
			return this.providedNode;
		}

		throw new Error(
			'Cannot select node: no node provided and randomizeNodes is not set to true.',
		);
	}

	broadcastSignatures(signatures) {
		return post(this.fullURL, this.headers, 'signatures', { signatures }).then(
			result => result.body,
		);
	}

	broadcastSignedTransaction(transaction) {
		return post(this.fullURL, this.headers, 'transactions', {
			transaction,
		}).then(result => result.body);
	}

	transferLSK(recipientId, amount, passphrase, secondPassphrase) {
		const body = { recipientId, amount, passphrase, secondPassphrase };
		return this.handlePost('transactions', body);
	}

	handlePost(endpoint, body) {
		return post(this.fullURL, this.headers, endpoint, body)
			.then(result => result.body)
			.catch(err => this.handlePostFailures(err, endpoint, body));
	}

	handlePostFailures(error, endpoint, body) {
		if (this.hasAvailableNodes()) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					if (this.randomizeNodes) {
						this.banActiveNode();
					}
					this.handlePost(endpoint, body).then(resolve, reject);
				}, 1000);
			});
		}
		return Promise.resolve({
			success: false,
			error,
			message: 'Could not create an HTTP request to any known nodes.',
		});
	}
}

/**
 * @method wrapGetRequest
 * @param endpoint
 * @param body
 *
 * @return {Function}
 */
const wrapGetRequest = (endpoint, getDataFn) =>
	function wrapped(value, options) {
		const providedOptions = options || {};
		const providedData = getDataFn(value, providedOptions);
		const query = Object.assign({}, providedData, providedOptions);
		return get(this.fullURL, this.headers, endpoint, query);
	};

[
	{
		methodName: 'getAccount',
		endpoint: 'accounts',
		dataFn: address => ({ address }),
	},
	{
		methodName: 'getActiveDelegates',
		endpoint: 'delegates',
		dataFn: limit => ({ limit }),
	},
	{
		methodName: 'getStandbyDelegates',
		endpoint: 'delegates',
		dataFn: (limit, { orderBy = 'rate:asc', offset = 101 }) => ({
			limit,
			orderBy,
			offset,
		}),
	},
	{
		methodName: 'getBlock',
		endpoint: 'blocks',
		dataFn: height => ({ height }),
	},
	{
		methodName: 'getBlocks',
		endpoint: 'blocks',
		dataFn: limit => ({ limit }),
	},
	{
		methodName: 'getForgedBlocks',
		endpoint: 'blocks',
		dataFn: generatorPublicKey => ({ generatorPublicKey }),
	},
	{
		methodName: 'getDapp',
		endpoint: 'dapps',
		dataFn: transactionId => ({ transactionId }),
	},
	{
		methodName: 'getDapps',
		endpoint: 'dapps',
		dataFn: data => data,
	},
	{
		methodName: 'getDappsByCategory',
		endpoint: 'dapps',
		dataFn: category => ({ category }),
	},
	{
		methodName: 'getTransaction',
		endpoint: 'transactions',
		dataFn: transactionId => ({ transactionId }),
	},
	{
		methodName: 'getTransactions',
		endpoint: 'transactions',
		dataFn: recipientId => ({ recipientId }),
	},
	{
		methodName: 'getUnsignedMultisignatureTransactions',
		endpoint: 'transactions/unsigned',
		dataFn: data => data,
	},
	{
		methodName: 'getVoters',
		endpoint: 'voters',
		dataFn: username => ({ username }),
	},
	{
		methodName: 'getVotes',
		endpoint: 'votes',
		dataFn: address => ({ address }),
	},
	{
		methodName: 'searchDelegatesByUsername',
		endpoint: 'delegates',
		dataFn: search => ({ search }),
	},
].forEach(obj => {
	LiskAPI.prototype[obj.methodName] = wrapGetRequest(obj.endpoint, obj.dataFn);
});
