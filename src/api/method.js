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

import { GET } from '../constants';
import * as utils from './utils';

// Bind to resource class
const apiMethod = spec => {
	const method = spec.method || GET;
	const path = spec.path || '';
	const urlParams = spec.urlParams || [];
	const validator = spec.validator || null;
	const defaultData = spec.defaultData || {};
	const retry = spec.retry || false;

	return function apiHandler(...args) {
		// this refers to resource class
		const self = this;
		// solve full URL with url params
		let fullURL = self.getResourcePath() + path;
		// get headers
		const headers = self.getHeaders();
		if (args.length < urlParams.length) {
			// Invalid input error
		}
		// solve url
		if (urlParams.length > 0) {
			fullURL = utils.solveURLParams(fullURL, urlParams);
		}
		// last argument is data
		let data = Object.assign({}, defaultData);
		if (args.length > urlParams.length > 0) {
			data = args[args.length - 1];
		}
		// # same as length of urlParams is the arguments, and the last one is data(body or query)
		if (validator && data) {
			validator(data);
		}
		let body = null;
		if (method === GET) {
			fullURL += `?${utils.toQueryString(data)}`;
		} else {
			body = data;
		}
		return self.request({
				method,
				url: fullURL,
				headers,
				body,
			}, retry);
	};
};

export default apiMethod;
