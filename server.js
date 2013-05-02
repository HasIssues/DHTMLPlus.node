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

//-- are we in Azure or IIS
if (process.env.PORT != undefined) {
    configName = "AZURE";
    port = process.env.PORT || 1337;
}
//-- HTTP Server for redirect
http.createServer(function (req, res) {
    console.log("\nREQUEST");
    var requestHost = req.headers.host.toLowerCase(); 
    var requestReferer = req.headers.referer;
    var requestHttpVersion = req.httpVersion;
    var requestURL = req.url;
    var requestMethod = req.method;
    var domain = "";
    var subDomain = "";
    var requestHostArray = requestHost.split(".");
    if (requestHostArray.length == 2) {
        domain = requestHostArray[0] + "." + requestHostArray[1];
    } else {
        domain = requestHostArray[requestHostArray.length - 2] + "." + requestHostArray[requestHostArray.length - 1];
        subDomain = requestHostArray[0];
    }
    //-- process redirect
    var processed = false;
    if (settings.config[configName].redirect != null) {
        if (subDomain == settings.config[configName].redirect[domain].subDomain) {
            var redirectTO = settings.config[configName].redirect[domain].directTo + "." + domain;
            console.log("Redirect " + requestHost + " to " + redirectTO);
            res.writeHead(302, { 'Content-Type': 'text/html', 'Location': 'http://' + redirectTO + '/' });
            res.end('<a href="http://' + redirectTO + '/">Redirecting to ' + redirectTO + '</a>');
            processed = true;
        }
    }
    //-- process request
    if (settings.config[configName].endpoint != null) {
        if (subDomain == settings.config[configName].endpoint[domain].subDomain) {
            console.log("Process " + requestMethod + " Request " + requestHost + requestURL);
            content.presenter(req, res, domain, settings.config[configName]);
            processed = true;
        }
    }
    //-- not processed
    if (!processed) {
        res.writeHead(404, { 'error': 'Site Not Found.' });
        res.end(requestHost + ' Not Found.');
        console.log(requestHost + ' Not Found.');
    }
}).listen(port);

//-- Done
console.log(configName + " Config used and Listening on port " + port + ".");
