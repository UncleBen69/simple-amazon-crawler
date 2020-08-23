const { ipcMain } = require("electron");
import { logger } from "./index";

var Crawler = require("simplecrawler");
var cheerio = require("cheerio");

export default function startCrawl(event, url, findURLS, id, window) {
	var crawler = new Crawler(url);

	var amazon_urls = new Set();
	var url_found = [];

	// Settings
	crawler.stripQuerystring = true;
	crawler.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36";
	crawler.respectRobotsTxt = false;
	

	crawler.on("crawlstart", function () {
		logger(window, `Crawl started on ${url} for window ${id}`, "crawler");

		let reply = {
			url,
			id,
		};
		event.reply("crawl::start", JSON.stringify(reply));
	});

	crawler.on("fetchstart", function () {
		//console.log("fetchStart");
	});

	crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
		logger(window, `Crawl on ${id} recieved ${queueItem.url} (${responseBuffer.length} bytes)`, "crawler");
		logger(window, `Resource type of ${response.headers["content-type"]}`, "crawler");

		let reply = {
			id,
			element: queueItem.url,
			url
		};
		event.reply("crawl::foundUrl", JSON.stringify(reply));
	});
	crawler.on("complete", function () {
		logger(window, `Completed Crawl on ${id} ${url}`, "crawler");

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
			/*
			console.log(
				`Running for: ${element}, current array looks like`,
				fixedFoundArray
			);
			*/
			for (let x = 0; x < url_found.length; x++) {
				if (url_found[x].url === element) {
					// NOT YET Check if this URL's already been added

					fixedFoundArray[i].foundOn.push(url_found[x].foundOn);
				}
			}
		}

		let reply = {
			id,
			url,
			urls: fixedFoundArray,
			searchedFor: findURLS,
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
			logger(window, `Window ${id} closed so crawler halting`, "crawler");

			crawler.stop();
		}
	});
}
