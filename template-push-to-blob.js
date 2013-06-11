var http = require('http');
var https = require('https');
var azure = require('azure');
var fs = require("fs");

//-- settings
var settings = require('./config.js');
var dev = require("./dev.js");

exports.publishTemplates = function (webRequest, webResponse, domain, settings, useCloudData, configName) {
	if (configName == "LOCAL") {
		walk("./templates/" + domain.replace(".", "-"), function(err, results) {
			if (err) { 
				webResponse.end(err.toString());
			} else {
				var blobService = azure.createBlobService(dev.devKeys["AZURE_STORAGE_ACCOUNT"], dev.devKeys["AZURE_STORAGE_ACCESS_KEY"]);
				webResponse.write("<h1>Deploy Templates for " + domain + "</h1>");
				webResponse.end(results.join("<br/>"));
			}
		});
	}
};

var walk = function(dir, done) {
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
						walk(file, function(err, res) { results = results.concat(res); next(); });
					} else {
						next();
					}
				} else {
					results.push(file);
					next();
				}
			});
		})();
	});
};

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
