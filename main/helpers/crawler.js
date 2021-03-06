const { ipcMain } = require("electron");
import { logger } from "./index";

var Crawler = require("simplecrawler");
var cheerio = require("cheerio");
var URL = require("url");
const { performance } = require("perf_hooks");

import Settings from "../settings";

export default function startCrawl(event, url, findURLS, id, window) {
	let startTime, endTime;
	
	startTime = performance.now();
	
	var crawler = new Crawler(url);

	var amazon_urls = new Set();
	let amazon_tags = new Set();
	var url_found = [];

	// Settings
	crawler.stripQuerystring = Settings.get("crawlerSettings.stripQuerystring");
	crawler.userAgent = Settings.get("crawlerSettings.userAgent");
	crawler.respectRobotsTxt = Settings.get("crawlerSettings.respectRobotsTxt");
	crawler.maxConcurrency = Settings.get("crawlerSettings.maxConcurrency");
	crawler.scanSubdomains = Settings.get("crawlerSettings.scanSubdomains");
	crawler.interval = Settings.get("crawlerSettings.interval"); 
	crawler.downloadUnsupported  = Settings.get("crawlerSettings.downloadUnsupported"); 

	crawler.on("crawlstart", function () {
		logger(window, `${id} Crawl started on ${url}`, "crawler");

		let reply = {
			url,
			id,
		};
		event.reply("crawl::start", JSON.stringify(reply));
	});

	crawler.on("fetchstart", function () {
		//console.log("fetchStart");
	});

	crawler.on("fetchcomplete", function (queueItem, responseBuffer) {
		logger(window, `${id} Crawled ${queueItem.url} (${responseBuffer.length} bytes)`, "crawler");
		//logger(window, `Resource type of ${response.headers["content-type"]}`, "crawler");

		let reply = {
			id,
			element: queueItem.url,
			url
		};
		event.reply("crawl::foundUrl", JSON.stringify(reply));
	});
	crawler.on("complete", function () {
		logger(window, `${id} Completed Crawl ${url}`, "crawler");

		//console.log([...amazon_urls]);
		let fixedFoundArray = [];
		let finishedURLS = [...amazon_urls];
		for (let i = 0; i < finishedURLS.length; i++) {
			const element = finishedURLS[i];
			// Find this URL in array
			fixedFoundArray.push({
				key: i,
				url: element,
				expanded: "None",
				foundOn: [],
			});
			for (let x = 0; x < url_found.length; x++) {
				if (url_found[x].url === element) {
					// NOT YET Check if this URL's already been added

					fixedFoundArray[i].foundOn.push(url_found[x].foundOn);
				}
			}
		}

		endTime = performance.now();

		let reply = {
			id,
			url,
			urls: fixedFoundArray,
			searchedFor: findURLS,
			tags: [...amazon_tags],
			runTime: (endTime - startTime),
		};
		event.reply("crawl::complete", JSON.stringify(reply));
	});

	crawler.discoverResources = function (buffer, queueItem) {
		//console.log("Item: ", queueItem);

		var $ = cheerio.load(buffer.toString("utf8"));

		let data = $("a[href]")
			.map(function () {
				return $(this).attr("href");
			})
			.get();

		//console.log("Data: ", data);

		for (let i = 0; i < data.length; i++) {
			const element = data[i];

			//console.log(element);

			// Add tag to set
			amazon_tags.add(URL.parse(element, true).query.tag);

			// Check if finding all URLS
			if (findURLS === false) {
				// Add to set
				amazon_urls.add(element);

				url_found.push({
					url: element,
					foundOn: queueItem.url,
				});
			} else {
				for (let x = 0; x < findURLS.length; x++) {
					//console.log(findURLS[x]);
					if (element.includes(findURLS[x])) {
						//console.log("Found Amazon Link: ", element);

						// Add to set
						amazon_urls.add(element);

						url_found.push({
							url: element,
							foundOn: queueItem.url,
						});
					}
				}
			}
		}

		return data;
	};

	crawler.start();
	

	ipcMain.on("crawler::stop", (event, arg) => {
		let data = JSON.parse(arg);

		if(data.id === id){
			logger(window, `${id} Window closed so crawler halting`, "crawler");

			crawler.stop();
		}
	});
}
