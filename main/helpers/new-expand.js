var rp = require("request-promise");
var url = require("url");

import { logger } from "./index";

let GlobalWindow;
let GlobalID;

export default async function expand(event, urls, id, window) {
	GlobalWindow = window;
	GlobalID = id;
	logger(GlobalWindow, `${GlobalID} Expand for urls: ${urls.length}`, "expander");
	var queue = require("fastq")(worker, 100);

	let newurls = urls;
	let amazon_tags = new Set();

	for (let i = 0; i < newurls.length; i++) {
		// Checking if string is valid

		let options = {
			uri: newurls[i].url,
			resolveWithFullResponse: true,
			simple: false,
			req_id: id,
			req_key: i,
		};

		// Check if valid URL
		if(validURL(options.uri)){
			queue.push(options, function (err, result) {
				if (err) { throw err; }

				newurls[i].completed = true;
				newurls[i].expanded = result.expanded;

				amazon_tags.add(result.tag);
			});
		}else{
			logger(GlobalWindow, `${GlobalID} URL ${options.uri} is invalid not expanding`, "expander");
			newurls[i].completed = true;
			newurls[i].expanded = null;
		}

		// On last iteration
		if (i == newurls.length - 1) {
			logger(GlobalWindow, `${GlobalID} Queue = ${queue.getQueue().length}`, "expander");
			wait(newurls, ()=>{
				let reply = {
					id,
					urls: newurls,
					tags: [...amazon_tags],
				};
				logger(GlobalWindow, `${GlobalID} Completed expand found ${[...amazon_tags].length} tags`, "expander");

				event.reply("expand::complete", JSON.stringify(reply));
			});
		}
	}
}
function wait(newurls, callback){
	let result = true;
	for (let i = 0; i < newurls.length; i++) {
		if (newurls[i].completed !== true) {
			//console.log(newurls[i]);
			result = false;
			break;
		}
	}

	//console.log(result);
	if(result == false){
		setTimeout(wait, 100, newurls, callback);
	/*
	if (queue.getQueue().length !== 0){
		setTimeout(wait,100, id, newurls);

	*/
	} else {
		// Return Data
		callback();
	}
}

function worker (options, cb) {
	rp(options)
		.then((result) => {
			let expanded = result.request.uri.href;
			let tag = url.parse(expanded, true).query.tag;
		

			logger(GlobalWindow, `${options.req_id} Expand on ${options.uri} found ${tag}`, "expander");

			cb(null, {expanded, tag});
			return;
		})
		.catch((err) => {
			// Crawling failed...
			logger(GlobalWindow, `${options.req_id}'s Expand failed on ${options.uri}, error: ${err}`, "expander");

			cb(null, null);
			return;
		});
}

function validURL(str) {
	if (str.charAt(0) == "#") return false;
	if (str.charAt(0) == "/") return false;
	if (str.includes("javascript:")) return false;

	try {
		new URL(str);
	} catch (_) {
		return false;  
	}
	
	return true;
}