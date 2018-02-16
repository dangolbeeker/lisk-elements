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
export const toQueryString = obj => {
	const parts = Object.entries(obj).reduce(
		(accumulator, [key, value]) => [
			...accumulator,
			`${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
		],
		[],
	);

	return parts.join('&');
};

export const solveURLParams = (url, params) => {
	let solvedURL = url;
	Object.keys(params).forEach(key => {
		solvedURL = solvedURL.replace(`{${key}}`, params[key]);
	});
	return solvedURL;
};

export const createURL = (baseURL, endpoint, query) => {
	let url = `${baseURL}/api/${endpoint}`;
	if (query) {
		url += `?${toQueryString(query)}`;
	}
	return url;
};
