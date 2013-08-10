var http = require('http');
var https = require('https');
var azure = require('azure');
var fs = require("fs");

//-- settings
var settings = require('./config.js');
var local = require("./local.js");

exports.publishTemplates = function (processRequest, processResponse, path, response, domain, settings, useCloudData, configName) {
	if (configName == "LOCAL") {
		baseDir = "./templates/" + domain.replace(".", "-");
		var publish = false;
		if (path.params["deploy"]) {
			walk(baseDir, domain, baseDir, function(err, results) {
				if (err) { 
					processResponse.end(err.toString());
				} else {
					processResponse.write("<h1>Deploy Templates for " + domain + "</h1>");
					processResponse.end(results.join("<br/>"));
				}
			});
		} else {
			processResponse.write("<!DOCTYPE html>\n");
			processResponse.write("<html><head><title>" + domain + "</title>");
			processResponse.write("</head><body>");
			processResponse.write("<h1>" + domain + " Publish</h1>");
			processResponse.write("<a href=\"publish.htm?deploy=true\">Deploy Templates to Azure Blob Storage</a>");
			processResponse.end("</body></html>");
		}
	}
};

var walk = function(dir, domain, baseDir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var i = 0;
		(function next() {
			var file = list[i++];
			if (!file) { return done(null, results); }
			file = dir + '/' + file;
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					if (!file.endsWith("/logs") && !file.endsWith("/archive")) {
						walk(file, domain, baseDir, function(err, res) { results = results.concat(res); next(); });
					} else {
						next();
					}
				} else {
					if (!file.endsWith("/Thumbs.db")) {
						results.push(file.substring(baseDir.length + 1));
						//-- upload file
						var blobService = azure.createBlobService(local.localKeys["AZURE_STORAGE_ACCOUNT"], local.localKeys["AZURE_STORAGE_ACCESS_KEY"]);
						blobService.createBlockBlobFromFile(domain.replace(".", "-"), file.substring(baseDir.length + 1), file,
							function (err) {
								if (err) { results.push("ERROR: " + file.substring(baseDir.length + 1)); }
							}
						);
					}
					next();
				}
			});
		})();
	});
};

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
