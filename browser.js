"use strict";

const os = require('os');

const puppeteer = require('puppeteer-core');

const mobDevice = puppeteer.devices['iPhone 6'];

let executablePath = '';

switch(os.type()) {
	case 'Linux':
		executablePath = '/usr/bin/google-chrome';
		break;
	case 'Darwin':
		executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
		break;
	case 'Windows_NT':
		executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
		break;
}

class Browser {
	async start() {
		this.browser = await puppeteer.launch({
			headless: true,
			executablePath: executablePath,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
	}

	async stop() {
		await this.browser.close();
	}

	async getPage(mobile) {
		const newPage = await this.browser.newPage();
		if (this.page) {
			await this.page.close();
		}

		if (mobile) {
			await newPage.emulate(mobDevice);
		}

		this.page = newPage;

		return this.page;
	}
};

module.exports.Browser = Browser;
