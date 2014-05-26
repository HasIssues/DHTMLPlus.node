http = null;
azure = null;
var fs = require("fs");
var os = require("os");
var local = null;
var settings = require("./config.js");
var content = require("./presenter.js");
var serverOptions = { };

//-- vars
var configName = "AZURE";
var numCPUs = os.cpus().length;
var machineName = os.hostname().toUpperCase();
var port = process.env.PORT || 1337;
var useCloudData = false;
var useCluster = false;
var useHttpSys = false;
var clusterForks = 2;
var siteAuth = null;

http = require("http");
azure = require("azure");
useCloudData = true;

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
        try {
            //content.presenter(req, res, domain, settings.config[configName], useCloudData, configName, "", local);
            res.end("offline");
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'text/html'});
            res.end(e);
        }
    } else {
        //-- not processed
        res.end("NOT HOSTED: " + subDomain + "." + domain + " REFERER: " + requestReferer);
        if (subDomain != "") {
            console.log("NOT HOSTED: " + subDomain + "." + domain + " REFERER: " + requestReferer);
        } else {
            console.log("NOT HOSTED: " + domain + " REFERER: " + requestReferer);
        }
    }
};

//-- start listener based on config
var server = http.createServer(function (req, res) { serverRequest(req, res); }).listen(port);
console.log("Machine " + machineName  + " with " + numCPUs + " CPUs.");
console.log("Running Node Version " + process.versions.node);
console.log("Listing on port " + port);
