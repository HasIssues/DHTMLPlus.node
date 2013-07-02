var http = require('http');
var https = require('https');
var fs = require('fs');
var os = require("os");
var cheerio = require("cheerio");
var azure = require('azure');

//-- includes
var settings = require('./config.js');
var content = require('./presenter.js');

//-- vars
var configName = "LOCAL";
var machineName = os.hostname().toUpperCase();
var port = 80;
var useCloudData = false; //-- change to true to run local against cloud resources

//-- are we in Azure or IIS
if (process.env.PORT != undefined) {
	configName = "AZURE";
	port = process.env.PORT || 1337;
	useCloudData = true;
}

//-- HTTP Server for redirect
http.createServer(function (req, res) {
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
}).listen(port);

//-- Ready and Listening
console.log(configName + " Config used and Listening on port " + port + " on machine " + machineName  + ".");
