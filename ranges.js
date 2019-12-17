'use strict';

module.exports.mergeRanges = (ranges) => {
	if (!(ranges && ranges.length)) {
		return [];
	}

	// Stack of final ranges
	var stack = [];

	// Sort according to start value
	ranges.sort(function(a, b) {
		return a.start - b.start;
	});

	// Add first range to stack
	stack.push(ranges[0]);

	ranges.slice(1).forEach(function(range, i) {
		var top = stack[stack.length - 1];

		if (top.end < range.start) {

			// No overlap, push range onto stack
			stack.push(range);
		} else if (top.end < range.end) {

			// Update previous range
			top.end = range.end;
		}
	});

	return stack;
};
