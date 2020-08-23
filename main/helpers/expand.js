var rp = require("request-promise");
var url = require("url");

import { logger } from "./index";

export default async function expand(event, urls, id, window) {
	logger(window, `Expand for ${id} urls: ${urls}`, "expander");

	let newurls = urls;
	var ps = [];

	for (let i = 0; i < newurls.length; i++) {
		// Checking if string is valid
		if (newurls[i].url.charAt(0) == "#") continue;
		if (newurls[i].url.charAt(0) == "/") continue;
		if (newurls[i].url.includes("javascript:")) continue;

		let options = {
			uri: newurls[i].url,
			resolveWithFullResponse: true,
			simple: false,
		};

		ps.push(rp(options));
	}

	var amazon_tags = new Set();

	Promise.all(ps)
		.then((results) => {
			logger(window, `Expand ${id} Results Length: ${results.length}`, "expander");
			for (let x = 0; x < results.length; x++) {
				const element = results[x];
				// Process html...
				let expanded = element.request.uri.href;

				newurls[x].expanded = expanded;

				//console.log(expanded);

				var url_parts = url.parse(expanded, true);

				logger(window, `Expand for ${id} found ${url_parts.query.tag}`, "expander");

				amazon_tags.add(url_parts.query.tag);

				if (x == newurls.length - 1) {
					logger(window, `Completed expand for ${id}`, "expander");
					let reply = {
						id,
						urls: newurls,
						tags: [...amazon_tags],
					};
					event.reply("expand::complete", JSON.stringify(reply));
				}
			}
		})
		.catch((err) => () => {
			logger(window, `Expand error on ${id}. Error: ${err}`, "expander");

			let reply = {
				type: "reply",
				message: "expand error",
				error: err,
			};
			event.reply("data", JSON.stringify(reply));
		}); // First rejected promise
}
