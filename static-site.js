var fs = require("fs");
var mime = require("mime");
var azure = require("azure");

exports.responseFile = function (processRequest, processResponse, domain, settings, useCloudData, configName, userName, local) {
    var templateDir = settings.templates.path + domain.replace(".", "-");
    var relativePath = decodeURIComponent(processRequest.url);
    if (relativePath.indexOf("?") > -1) { relativePath = uriString.split("?")[0]; }
    if (relativePath == "/") { relativePath = "/" + settings.endpoint[domain].default}

    if (useCloudData) {
        var blobService = null;
        if (configName == "LOCAL") {
            //-- do this to run local but use cloud storage
            blobService = azure.createBlobService(local.localKeys["AZURE_STORAGE_ACCOUNT"], local.localKeys["AZURE_STORAGE_ACCESS_KEY"]);
        } else {
            //-- get access keys from IIS in Azure
            blobService = azure.createBlobService();
        }
        console.log("STATIC BLOB: " + relativePath);
        processResponse.writeHead(200, { "Content-Type": mime.lookup(relativePath) });
        blobService.getBlobToStream(domain.replace(".", "-"), relativePath.substring(1,relativePath.length), processResponse,
            function (err) {
                if (err) { console.log("STATICE BLOB ERROR:" + relativePath + ": " + err); }
                processResponse.end();
            }
        );
    } else {
        fs.readFile(templateDir + relativePath, null, function (err, data) {
            if (err) {
                console.log("STATIC: " + templateDir + relativePath + " ERROR: " + err.toString());
                processResponse.writeHead(404, { "Content-Type": "text/html", "error": "File Not Found." });
                processResponse.end("Not Found.");
            } else {
                console.log("STATIC: " + templateDir + relativePath);
                processResponse.writeHead(200, { "Content-Type": mime.lookup(templateDir + relativePath) });
                processResponse.end(data);
            }
        });
    }
};

String.prototype.endsWith = function(suffix) { return this.indexOf(suffix, this.length - suffix.length) !== -1; };
String.prototype.startsWith = function(str) {return (this.match("^"+str)==str)};
String.prototype.trim = function() { return (this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "")) };
String.prototype.toProperCase = function() {return this.toLowerCase().replace(/^(.)|\s(.)/g,function($1) { return $1.toUpperCase(); });};
String.prototype.startsWithAny = function(matchThis) {
    var hasMatch = false;
    for (index = 0; index < matchThis.length; ++index) {
        if (this.match("^" + matchThis[index]) == matchThis[index]) { hasMatch = true; }
    }
    return hasMatch;
};
