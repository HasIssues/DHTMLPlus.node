var http = require('http');
var https = require('https');
var fs = require('fs');
var os = require("os");

//-- includes
var settings = require('./config.js');
var content = require('./presenter.js');

//-- vars
var machineName = os.hostname().toUpperCase();
var port = 80;

//-- are we in azure
if (machineName != "BUILDINTHECLOUD") {
    machineName = "AZURE";
    port = process.env.PORT || 1337;
}
//-- HTTP Server for redirect
http.createServer(function (req, res) {
    console.log("\nREQUEST");
    var requestHost = req.headers.host.toLowerCase();
    var requestReferer = req.headers.referer;
    var requestURL = req.headers.url;
    var requestMethod = req.headers.method;
    var domain = "";
    var subDomain = "";
    var requestHostArray = requestHost.split(".");
    if (requestHostArray.length == 2) {
        domain = requestHostArray[1] + "." + requestHostArray[2];
    } else {
        domain = requestHostArray[1] + "." + requestHostArray[2];
        subDomain = requestHostArray[0];
    }
    //-- process redirect
    var processed = false;
    if (settings.config[machineName].redirect[domain] != null) {
        if (subDomain == settings.config[machineName].redirect[domain][0]) {
            var redirectTO = settings.config[machineName].redirect[domain][2] + "." + domain;
            console.log("Redirect to " + redirectTO);
            res.writeHead(302, { 'Content-Type': 'text/html', 'Location': 'http://' + redirectTO + '/' });
            res.end('<a href="http://' + redirectTO + '/">Redirecting to ' + redirectTO + '</a>');
            processed = true;
        }
    }
    //-- process request
    if (settings.config[machineName].endpoint[domain] != null) {
        if (subDomain == settings.config[machineName].endpoint[domain][0]) {
            console.log("Process " + requestHost);
            content.presenter(req, res);
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
console.log('Ready.');
