"use strict";

const {Browser} = require('./browser');
const {getCoverage} = require('./coverage');

module.exports.coverageAudit = async (url, mobile) => {
	const b = new Browser();

	await b.start();
	const page = await b.getPage(mobile);

	const pageCoverage = await getCoverage(page, url);

	await b.stop();

	return pageCoverage;
};
