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

import * as popsicle from 'popsicle';

export default class LiskResource {
	constructor(liskAPI) {
		this.liskAPI = liskAPI;
	}

	getHeaders() {
		return this.liskAPI.headers;
	}

	getResourcePath() {
		return `${this.liskAPI.fullURL}/api/${this.path}`;
	}

	request(req, retry) {
		const request = popsicle
			.request(req)
			.use(popsicle.plugins.parse(['json', 'urlencoded']))
			.then(res => res.body);

		if (retry) {
				request
				.catch(err => this.handlePostFailures(err, req));
		}
		return request;
	}

	handlePostFailures(error, req) {
		if (this.liskAPI.hasAvailableNodes()) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					if (this.liskAPI.randomizeNodes) {
						this.liskAPI.banActiveNode();
					}
					this.request(req, true).then(resolve, reject);
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
