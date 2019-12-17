"use strict";

const autoScroll = require('./scroll').autoScroll;

module.exports.getCoverage = async (page, url) => {
	await Promise.all([
		page.coverage.startJSCoverage(),
		page.coverage.startCSSCoverage()
	]);

	await page.goto(url);
	await autoScroll(page);

	//Retrive the coverage objects
	const [jsCoverage, cssCoverage] = await Promise.all([
		page.coverage.stopJSCoverage(),
		page.coverage.stopCSSCoverage(),
	]);

	return {
		js: jsCoverage,
		css: cssCoverage,
	};
};
