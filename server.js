var http = null;
var fs = require("fs");
var os = require("os");
var cheerio = require("cheerio");
var azure = require('azure');

//-- includes
var settings = require("./config.js");
var content = require("./presenter.js");

//-- vars
var configName = "LOCAL";
var numCPUs = require("os").cpus().length;
var machineName = os.hostname().toUpperCase();
var port = 80;
var useCloudData = false;
var useCluster = false;

//-- are we in Azure or IIS
if (process.env.PORT != undefined) {
	configName = "AZURE";
	port = process.env.PORT || 1337;
	useCloudData = true;
	http = require("http");
} else {
	//http = require("httpsys").http();
	http = require("http");
	var local = require("./local.js");
	//-- these are set in local.js
	port = local.localKeys["port"];
	useCloudData = local.localKeys["useCloudData"];
	useCluster = local.localKeys["useCluster"];
}

//-- HTTP Server for redirect
var server = http.createServer(function (req, res) {
	var requestHost = req.headers.host; 
	var requestReferer = req.headers.referer;
	var requestHttpVersion = req.httpVersion;
	var requestURL = req.url;
	var requestMethod = req.method;
	var domain = "";
	var subDomain = "";
	if (requestHost !== undefined) {
		if (requestHost.indexOf(".") > 0) {
			var requestHostArray = requestHost.split(".");
			if (requestHostArray.length == 2) {
				domain = requestHostArray[0] + "." + requestHostArray[1];
			} else {
				domain = requestHostArray[requestHostArray.length - 2] + "." + requestHostArray[requestHostArray.length - 1];
				subDomain = requestHostArray[0];
			}
		} else {
			console.log("Unable to process: " + requestHost);
		}
	}
	//-- now lets respond to a request
	var redirect = false;
	if (settings.config[configName].redirect[domain] != undefined) {
		if (settings.config[configName].redirect != null && subDomain == settings.config[configName].redirect[domain].subDomain) {
			redirect = true;
		}
	}
	var hosted = false;
	if (settings.config[configName].endpoint[domain] != undefined) {
		if (settings.config[configName].endpoint != null && subDomain == settings.config[configName].endpoint[domain].subDomain) {
			hosted = true;
		}
	}
	if (redirect) {
		//-- process redirect
		var redirectTO = settings.config[configName].redirect[domain].directTo + "." + domain;
		console.log("Redirect " + requestHost + " to " + redirectTO);
		res.writeHead(302, { 'Content-Type': 'text/html', 'Location': 'http://' + redirectTO + '/' });
		res.end('<a href="http://' + redirectTO + '/">Redirecting to ' + redirectTO + '</a>');
	} else if (hosted) {
		//-- process request
		content.presenter(req, res, domain, settings.config[configName], useCloudData, configName);
	} else {
		//-- not processed
		res.end();
		if (subDomain != "") {
			console.log("NOT HOSTED: " + subDomain + "." + domain + " REFERER: " + requestReferer);
		} else {
			console.log("NOT HOSTED: " + domain + " REFERER: " + requestReferer);
		}
	}
});
if (configName == "LOCAL" && useCluster) {
	var cluster = require("cluster");
	if (cluster.isMaster) {
		console.log("Machine " + machineName  + " with " + numCPUs + " CPUs.");
		console.log("Running Node Version " + process.versions.node);
		// Fork workers. one less then max cpu count
		for (var i = 1; i < numCPUs; i++) { cluster.fork(); }
		cluster.on("exit", function(worker, code, signal) {
			var exitCode = worker.process.exitCode;
			console.log("worker " + worker.process.pid + " died (" + exitCode + "). restarting...");
			cluster.fork();
		});
		cluster.on('listening', function(worker, address) {
			console.log("Worker " + worker.process.pid + " listening  on " + address.port);
		});
	} else {
		// Workers can share any TCP connection, In this case its a HTTP server
		//server.listen("http://*:80/");
		server.listen(port);
	}
} else {
	server.listen(port);
	console.log("Machine " + machineName  + " with " + numCPUs + " CPUs.");
	console.log("Running Node Version " + process.versions.node);
	console.log("Listing  on port " + port);
}
