"use strict";

const _ = require('lodash');

const {mergeRanges} = require('./ranges');

const sumRangeUsage = ranges => {
	return ranges.reduce((total, range) => {
		return total + range.end - range.start - 1;
	}, 0);
};  

const coverageResult = (coverage) => (
	coverage
		.map(({ url, text, ranges, type }) => {
			const usedBytes = sumRangeUsage(mergeRanges(ranges));
			const totalBytes = text.length;
			const unusedBytes = totalBytes - usedBytes;

			const unusedPercentage = totalBytes ? (unusedBytes * 100 / totalBytes) : 0;
			const usedPercentage = 100 - unusedPercentage;

			return {
				url,
				type,
				totalBytes,
				usedBytes,
				unusedBytes,
				usedPercentage,
				unusedPercentage,
			};
		})
		.sort(({ usedPercentage: A }, { usedPercentage: B }) => {
			return A - B;
		})
);

const totalResult = (cov) => {
	const totalBytes = _.sumBy(cov, 'totalBytes');
	const unusedBytes = _.sumBy(cov, 'unusedBytes');

	const unusedPercentage = totalBytes ? (unusedBytes * 100 / totalBytes) : 0;
	const usedPercentage = 100 - unusedPercentage;

	return {
		totalBytes: totalBytes,
		unusedBytes: unusedBytes,
		unusedPercentage: unusedPercentage,
		usedPercentage: usedPercentage,
	};
};

module.exports.coverageReport = (cov) => {
	const jsCov = coverageResult(cov.js)
	const cssCov = coverageResult(cov.css)

	return {
		js: jsCov,
		css: cssCov,
		page: {
			js: totalResult(jsCov),
			css: totalResult(cssCov),
		}
	};
};

