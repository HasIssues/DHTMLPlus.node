http = null;
azure = null;
var os = require("os");
var local = null;
var settings = require("./config.js");
var content = require("./presenter.js");
var serverOptions = { };

//-- vars
var configName = "";
var numCPUs = os.cpus().length;
var machineName = os.hostname().toUpperCase();
var port = 80;
var useCloudData = false;
var useCluster = false;
var useHttpSys = false;
var clusterForks = 2;
var siteAuth = null;

//-- messaging
var consoleLog = function (message, force) {
	console.log(message);
};

//-- get cmd line overrides
process.argv.forEach(function (val, index, array) {
    if (val.indexOf("=") > 0) {
        var param = val.split("=");
        try {
            if (param[0].toLowerCase() === "env") { configName = param[1].toUpperCase(); }
        } catch (e) { }
    }
});

//-- are we in Azure or IIS
if (process.env.PORT != undefined && configName == "") {
	http = require("http");
	azure = require("azure");
	configName = "AZURE";
	port = process.env.PORT || 1337;
	useCloudData = true;
} else {
    if (configName == "") { configName = "LOCAL"; }
	local = require("./local.js");
	//-- these are set in local.js
	port = local.localKeys["port"];
	useCloudData = local.localKeys["useCloudData"];
	useCluster = local.localKeys["useCluster"];
	useHttpSys = local.localKeys["useHttpSys"];
	clusterForks = local.localKeys["clusterForks"] != null ? local.localKeys["clusterForks"] : numCPUs;
	if (useHttpSys) {
		//-- uses native http.sys on windows only
		consoleLog("Using Native Mode HTTP.sys");
		serverOptions = { "HTTPSYS_CACHE_DURATION": 0, "HTTPSYS_BUFFER_SIZE": 16384, "HTTPSYS_REQUEST_QUEUE_LENGTH": 10000, "HTTPSYS_PENDING_READ_COUNT": 5 };
		http = require("httpsys").http();
	} else {
		http = require("http");
	}
};

var serverInfo = function() {
	consoleLog("");
	consoleLog("\x1b[36mMachine " + os.hostname().toUpperCase()  + " with " + numCPUs + " CPUs. In cluster Mode.\x1b[0m", true);
	//consoleLog("\x1b[36mRunning in " + (serverSettings.ssl ? "Secure SSL" : "HTTP Only") + " mode.\x1b[0m", true);
	consoleLog("\n\x1b[42m                             \x1b[0m");
	consoleLog("\x1b[32m Environment....: \x1b[0m" + configName);
	//consoleLog("\x1b[32m HTTP2..........: \x1b[0m" + serverSettings.http2);
	consoleLog("\x1b[32m Port...........: \x1b[0m" + port);
	consoleLog("\x1b[32m Debug Port.....: \x1b[0m" + process.debugPort);
	//consoleLog("\x1b[32m Cluster........: \x1b[0m" + serverSettings.cluster);
	//consoleLog("\x1b[32m Listeners......: \x1b[0m" + serverSettings.listeners);
	//consoleLog("\x1b[32m SSL............: \x1b[0m" + serverSettings.ssl);
	//consoleLog("\x1b[32m Nocache........: \x1b[0m" + serverSettings.nocache);
	//consoleLog("\x1b[32m Compress.......: \x1b[0m" + serverSettings.compress);
	//consoleLog("\x1b[32m Gzip...........: \x1b[0m" + serverSettings.gzip);
	//consoleLog("\x1b[32m Dev............: \x1b[0m" + serverSettings.dev);
    //consoleLog("\x1b[32m cacheBuster....: \x1b[0m" + serverSettings.cacheBuster);
    
    consoleLog("\x1b[32m useCloudData...: \x1b[0m" + useCloudData);
    consoleLog("\x1b[32m useCluster.....: \x1b[0m" + useCluster);
    consoleLog("\x1b[32m useHttpSys.....: \x1b[0m" + useHttpSys);
    consoleLog("\x1b[32m clusterForks...: \x1b[0m" + clusterForks);

	consoleLog("\x1b[33m Node/io.js.....: \x1b[0m" + process.versions.node);
	consoleLog("\x1b[33m Http Parser....: \x1b[0m" + process.versions.http_parser);
	consoleLog("\x1b[33m V8.............: \x1b[0m" + process.versions.v8);
	consoleLog("\x1b[33m UV.............: \x1b[0m" + process.versions.uv);
	consoleLog("\x1b[33m zlib...........: \x1b[0m" + process.versions.zlib);
	consoleLog("\x1b[33m Ares...........: \x1b[0m" + process.versions.ares);
	consoleLog("\x1b[33m Modules........: \x1b[0m" + process.versions.modules);
	consoleLog("\x1b[33m OpenSSL........: \x1b[0m" + process.versions.openssl);
	consoleLog("\x1b[33m Arch...........: \x1b[0m" + process.arch);
	consoleLog("\x1b[33m Platform.......: \x1b[0m" + os.platform());
	consoleLog("\x1b[42m                             \x1b[0m\n");		
};

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
			consoleLog("Unable to process: " + requestHost);
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
		consoleLog("Redirect " + requestHost + " to " + redirectTO);
		res.writeHead(302, { 'Content-Type': 'text/html', 'Location': 'http://' + redirectTO + '/' });
		res.end('<a href="http://' + redirectTO + '/">Redirecting to ' + redirectTO + '</a>');
	} else if (hosted) {
        var useSecurity = false;
		if ("auth" in settings.config[configName].endpoint[domain]) {
            if (settings.config[configName].endpoint[domain].auth != "none") {
                useSecurity = true;
                //-- BASED ON: http://www.sitepoint.com/http-authentication-in-node-js/
                var securityType = settings.config[configName].endpoint[domain].auth; //-- basic or digest
                var auth = require('http-auth');
                var options = { realm: domain, file: "./" + securityType + "-htpasswd" };
                var authConfig = (securityType == 'basic' ? auth.basic(options) : auth.digest(options));
                auth.connect(authConfig)(req, res, function() {
                    consoleLog("SECURITY: " + req.user + " " + securityType + " security for " + domain);
                    try {
                        content.presenter(req, res, domain, settings.config[configName], useCloudData, configName, req.user, local);
                    } catch (e) {
                        res.writeHead(500, { 'Content-Type': 'text/html'});
                        res.end(e);
                    }
                });
            }
        }
		if (!useSecurity) {
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
			consoleLog("NOT HOSTED: " + subDomain + "." + domain + " REFERER: " + requestReferer);
		} else {
			consoleLog("NOT HOSTED: " + domain + " REFERER: " + requestReferer);
		}
	}
};

//-- start listener based on config
if (configName == "LOCAL" && useCluster) {
	var cluster = require("cluster");
	if (cluster.isMaster) {
		serverInfo();
		// start clusters
		for (var i = 1; i <= clusterForks; i++) { cluster.fork(); }
		cluster.on("exit", function(worker, code, signal) { var exitCode = worker.process.exitCode; console.log("worker " + worker.process.pid + " died (" + exitCode + "). restarting..."); cluster.fork(); });
		cluster.on('listening', function(worker, address) { console.log("Worker " + worker.process.pid + " listening  on " + address.port); });
	} else {
		// Workers can share any TCP connection, In this case its a HTTP server
		var server = http.createServer(function (req, res) { serverRequest(req, res); }).listen(port);
	}
} else if (configName == "LOCAL" && !useCluster && useHttpSys) {
	serverInfo();
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
	serverInfo();
}
