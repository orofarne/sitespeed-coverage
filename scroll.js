"use strict";

async function autoScroll(page){
	await page.evaluate(async () => {
		await new Promise((resolve, reject) => {
			const distance = 100;
			const interval = 100;
			const scrollLimit = 200;

			let totalHeight = 0;
			let scrollCounter = 0;

			const timer = setInterval(() => {
				scrollCounter++;

				const scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;

				if (totalHeight >= scrollHeight || scrollCounter >= scrollLimit) {
					clearInterval(timer);
					resolve();
				}
			}, interval);
		});
	});
}

module.exports.autoScroll = autoScroll;
