const { workerData, parentPort } = require("worker_threads");

var rp = require("request-promise");
var url = require("url");


//console.log("WorkerData ", workerData);

rp(workerData)
	.then((result) => {
		let expanded = result.request.uri.href;
		let tag = url.parse(expanded, true).query.tag;

		parentPort.postMessage({ type: "completed", data: {expanded, tag} });
		return;
	})
	.catch((err) => {
		// Crawling failed...

		parentPort.postMessage({ type: "failed", message: err.message});
		return;
	});
