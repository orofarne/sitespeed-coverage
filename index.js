
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge');

const {coverageAudit} = require('./audit');
const {coverageReport} = require('./report');

const DEFAULT_METRICS_PAGESUMMARY = [
	'page.js.*',
	'page.css.*',
];

module.exports = {
	name() {
		return 'coverage';
	},
	open(context, options) {
		this.make = context.messageMaker('coverage').make;

		this.options = {
			coverage: options.coverage,
			mobile: options.mobile
		};

		// Register a logger for this plugin, a unique name so we can filter the log
		this.log = context.intel.getLogger('sitespeedio.plugin.coverage');

		// Register which metrics we want to send to data storage
		context.filterRegistry.registerFilterForType(
			DEFAULT_METRICS_PAGESUMMARY,
			'coverage.pageSummary'
		);

		this.pug = fs.readFileSync(
			path.resolve(__dirname, 'pug', 'index.pug'),
			'utf8'
		);

		this.usingBrowsertime = false;
		this.summaries = 0;
		this.urls = [];
	},
	async processMessage(message, queue) {
		const make = this.make;
		const log = this.log;
		switch (message.type) {
			case 'sitespeedio.setup': {
				// Tell the HTML plugin that this plugin got a pug of the type
				// pageSummary = it will be shown on the page summary page
				// If you got data that differs per run, the the type will be
				// run.
				queue.postMessage(
					make('html.pug', {
						id: 'coverage',
						name: 'Coverage',
						pug: this.pug,
						type: 'pageSummary'
					})
				);
				break;
			}

			case 'browsertime.setup': {
				// We know we will use Browsertime so we wanna keep track of Browseertime summaries
				this.usingBrowsertime = true;
				log.info('Will run coverage tests after Browsertime has finished');
				break;
			}

			case 'browsertime.pageSummary': {
				if (this.usingBrowsertime) {
					this.summaries++;
					if (this.summaries === this.urls.length) {
						queue.postMessage(make('coverage.audit', Object.assign([], this.urls)));
					}
				}
				break;
			}

			case 'browsertime.navigationScripts': {
				log.info(
					'Coverage can only be used on URLs and not with scripting/multiple pages at the moment'
				);
				break;
			}

			case 'url': {
				if (this.usingBrowsertime) {
					this.urls.push({ url: message.url, group: message.group });
				} else {
					const url = message.url;
					const group = message.group;
					queue.postMessage(
						make('coverage.audit', [{
							url,
							group
						}])
					);
				}
				break;
			}

			case 'coverage.audit': {
				for (let urlAndGroup of message.data) {
					const { url, group } = urlAndGroup;
					log.info(`Starting coverage test for ${url}`);
					const audit = await coverageAudit(url, this.options.mobile);
					const report = coverageReport(audit);
					log.info(`Got coverage for ${url}`);
					queue.postMessage(
						make(
							'coverage.pageSummary',
							merge(report, { iterations: 1 }),
							{ url, group }
					)
					);
				}
				break;
			}
		}
	}
};
