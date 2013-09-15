var template = require('./template-data-merge.js');
var cheerio = require("cheerio");
var azure = require('azure');

exports.presenter = function (req, res, domain, settings, useCloudData, configName, userName, local) {
	var requestHost = req.headers.host.toLowerCase();
	var requestReferer = req.headers.referer;
	var requestHttpVersion = req.httpVersion;
	var requestURL = req.url;
	var requestMethod = req.method;
	//-- if default azure site, list all sites
	if (domain.indexOf("azurewebsites.net") > -1) {
		var sHTM = "<h1>Azure Web Sites</h1>";
		for (var node in settings.endpoint) {
			if (node != "azurewebsites.net") {
				sHTM += "<a href=\"http://preview." + node + "\" target=\"_blank\">preview</a> <a href=\"http://www." + node + "\" target=\"_blank\">www</a> " + node + "<br/>";
			}
		}
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(sHTM);
	} else if (requestURL == "/DHTMLPlus-content-edit.js") {
		var fs = require("fs");
		fs.readFile("./DHTMLPlus-content-edit.js", "utf8", function (err, data) {
			if (err) {
				res.writeHead(404, { 'Content-Type': "text/javascript", 'error': 'File Not Found.' });
				res.end("OPPS");
			} else {
				res.writeHead(200, { 'Content-Type': "text/javascript" });
				res.end(data);
			}
		});
	} else if (requestURL == "/DHTMLPlus-content-edit.css") {
		var fs = require("fs");
		fs.readFile("./DHTMLPlus-content-edit.css", "utf8", function (err, data) {
			if (err) {
				res.writeHead(404, { 'Content-Type': "text/css", 'error': 'File Not Found.' });
				res.end("OPPS");
			} else {
				res.writeHead(200, { 'Content-Type': "text/css" });
				res.end(data);
			}
		});
	} else {
		template.templateDataMerge(req, res, domain, settings, useCloudData, configName, userName, local);
	}
};
