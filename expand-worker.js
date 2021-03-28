const { workerData, parentPort } = require("worker_threads");

var rp;
console.log(workerData.isProd);
if(workerData.isProd){
	rp = require("./resources/app/node_modules/request-promise");
} else{
	rp = require("request-promise");
}

//console.log("WorkerData ", workerData);

rp(workerData)
	.then((result) => {
		let expanded = result.request.uri.href;
		//let tag = url.parse(expanded, true).query.tag;
		let tag = new URL(expanded).searchParams.get("tag");

		parentPort.postMessage({ type: "completed", data: {expanded, tag} });
		return;
	})
	.catch((err) => {
		// Crawling failed...

		parentPort.postMessage({ type: "failed", message: err.message});
		return;
	});
