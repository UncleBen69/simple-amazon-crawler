
import ExpanderWorker from "!!raw-loader!../../expand-worker.js";

import { logger } from "./index";
const { Worker } = require("worker_threads");

const { performance } = require("perf_hooks");

import Settings from "../settings";

var GlobalWindow;

export default async function expand(event, urls, id, window) {
	let startTime, endTime;

	startTime = performance.now();
	
	GlobalWindow = window;

	logger(GlobalWindow, `${id} Expand for urls: ${urls.length}`, "expander");
	var queue = require("fastq")(worker, Settings.get("expandSettings.parallel"));

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
			logger(GlobalWindow, `${id} URL ${options.uri} is invalid not expanding`, "expander");
			newurls[i].completed = true;
			newurls[i].expanded = null;
		}

		// On last iteration
		if (i == newurls.length - 1) {
			logger(GlobalWindow, `${id} Queue = ${queue.getQueue().length}`, "expander");
			wait(newurls, ()=>{
				endTime = performance.now();

				let reply = {
					id,
					urls: newurls,
					tags: [...amazon_tags],
					runTime: (endTime - startTime)
				};
				logger(GlobalWindow, `${id} Completed expand found ${[...amazon_tags].length} tags`, "expander");

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
	const worker = new Worker(ExpanderWorker, { workerData: options, eval: true});

	worker.on("message", (message)=>{
		//console.log(message);
		if(message.type == "completed"){
			const { data } = message;

			logger(GlobalWindow, `${options.req_id} Expand on ${options.uri} found ${data.tag}`, "expander");
	

			cb(null, {
				expanded: data.expanded, 
				tag: data.tag,
			});
		}else{
			// Error in request
			logger(GlobalWindow, `${options.req_id}'s Expand failed on ${options.uri}, error: ${message.error}`, "expander");

			cb(null, null);
		}
	});
	worker.on("error", (err)=>{
		logger(GlobalWindow, `${options.req_id}'s Worker failed on ${options.uri}, error: ${err.error}`, "expander");

		cb(null, null);
	});

	worker.on("exit", (code) => {
		if (code !== 0){
			//console.log(`Error, exit code: ${code}`);
			logger(GlobalWindow, `${options.req_id}'s Worker failed on ${options.uri}, error code: ${code}`, "expander");
		}
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