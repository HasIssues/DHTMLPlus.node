http = null;
azure = null;
var fs = require("fs");
var os = require("os");
var local = require("./local.js");
var settings = require("./config.js");
var content = require("dhtmlplus"); //-- for deployment
//var content = require("../dhtmlplus/index.js"); //-- for local development
var serverOptions = { };

//-- vars
var configName = "LOCAL";
var numCPUs = os.cpus().length;
var machineName = os.hostname().toUpperCase();
var port = 80;
var useCloudData = false;
var useCluster = false;
var useHttpSys = false;
var clusterForks = 2;

//-- are we in Azure or IIS
if (process.env.PORT != undefined) {
	http = require("http");
	azure = require("azure");
	configName = "AZURE";
	port = process.env.PORT || 1337;
	useCloudData = true;
} else {
	local = require("./local.js");
	//-- these are set in local.js
	port = local.localKeys["port"];
	useCloudData = local.localKeys["useCloudData"];
	useCluster = local.localKeys["useCluster"];
	useHttpSys = local.localKeys["useHttpSys"];
	clusterForks = local.localKeys["clusterForks"] != null ? local.localKeys["clusterForks"] : numCPUs;
	if (useHttpSys) {
		//-- uses native http.sys on windows only
		console.log("Using Native Mode HTTP.sys");
		serverOptions = { "HTTPSYS_CACHE_DURATION": 0, "HTTPSYS_BUFFER_SIZE": 16384, "HTTPSYS_REQUEST_QUEUE_LENGTH": 10000, "HTTPSYS_PENDING_READ_COUNT": 5 };
		http = require("httpsys").http();
	} else {
		http = require("http");
	}
}

//-- HTTP Server for redirect
var serverRequest = function (req, res) {
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
		if ("auth" in settings.config[configName].endpoint[domain]) {
			if (settings.config[configName].endpoint[domain].auth != "none") {
				//-- BASED ON: http://www.sitepoint.com/http-authentication-in-node-js/
				var auth = require("http-auth");
				var authConfig = auth({ authRealm: domain, authFile: "./" + settings.config[configName].endpoint[domain].auth + "-htpasswd", authType: settings.config[configName].endpoint[domain].auth });
				authConfig.apply(req, res, function (username) {
					//-- process request with security
					try {
						content.presenter(req, res, domain, settings.config[configName], useCloudData, configName, username, local);
					} catch (e) {
						res.writeHead(500, { 'Content-Type': 'text/html'});
						res.end(e);
					}
				});
			}
		} else {
			//-- process request without security
			try {
				content.presenter(req, res, domain, settings.config[configName], useCloudData, configName, "", local);
			} catch (e) {
				res.writeHead(500, { 'Content-Type': 'text/html'});
				res.end(e);
			}
		}
	} else {
		//-- not processed
		res.end();
		if (subDomain != "") {
			console.log("NOT HOSTED: " + subDomain + "." + domain + " REFERER: " + requestReferer);
		} else {
			console.log("NOT HOSTED: " + domain + " REFERER: " + requestReferer);
		}
	}
};

//-- start listener based on config
if (configName == "LOCAL" && useCluster) {
	var cluster = require("cluster");
	if (cluster.isMaster) {
		console.log("Machine " + machineName  + " with " + numCPUs + " CPUs.");
		console.log("Running Node Version " + process.versions.node);
		for (var i = 1; i <= clusterForks; i++) { cluster.fork(); }
		cluster.on("exit", function(worker, code, signal) { var exitCode = worker.process.exitCode; console.log("worker " + worker.process.pid + " died (" + exitCode + "). restarting..."); cluster.fork(); });
		cluster.on('listening', function(worker, address) { console.log("Worker " + worker.process.pid + " listening  on " + address.port); });
	} else {
		// Workers can share any TCP connection, In this case its a HTTP server
		var server = http.createServer(function (req, res) { serverRequest(req, res); }).listen(port);
	}
} else if (configName == "LOCAL" && !useCluster && useHttpSys) {
	console.log("Machine " + machineName  + " with " + numCPUs + " CPUs.");
	console.log("Running Node Version " + process.versions.node);
	for (var domain in settings.config.LOCAL.endpoint) {
		var webServerAddress = "http://";
		if (settings.config.LOCAL.endpoint[domain].subDomain == "") {
			webServerAddress += domain + ":" + settings.config.LOCAL.endpoint[domain].port + "/";
		} else {
			webServerAddress += settings.config.LOCAL.endpoint[domain].subDomain + "." + domain + ":" + settings.config.LOCAL.endpoint[domain].port + "/";
		}
		try {
			var server = http.createServer(serverOptions, function (req, res) { serverRequest(req, res); }).listen(webServerAddress);
			console.log("WEB SERVER: " + webServerAddress);
		} catch (e) {
			console.log("FAIL WEB SERVER: " + webServerAddress);
		}
	}
	for (var domain in settings.config.LOCAL.redirect) {
		var webServerAddress = "http://";
		if (settings.config.LOCAL.redirect[domain].subDomain == "") {
			webServerAddress += domain + ":" + settings.config.LOCAL.redirect[domain].subDomainPort + "/";
		} else {
			webServerAddress += settings.config.LOCAL.redirect[domain].subDomain + "." + domain + ":" + settings.config.LOCAL.redirect[domain].subDomainPort + "/";
		}
		try {
			var server = http.createServer(serverOptions, function (req, res) { serverRequest(req, res); }).listen(webServerAddress);
			console.log("REDIRECT: " + webServerAddress);
		} catch (e) {
			console.log("FAIL REDIRECT: " + webServerAddress);
		}
	}
} else {
	var server = http.createServer(function (req, res) { serverRequest(req, res); }).listen(port);
	console.log("Machine " + machineName  + " with " + numCPUs + " CPUs.");
	console.log("Running Node Version " + process.versions.node);
	console.log("Listing on port " + port);
}
