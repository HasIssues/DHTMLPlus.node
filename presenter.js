var template = require('./template-data-merge.js');
var cheerio = require("cheerio");
var azure = require('azure');

exports.presenter = function (req, res, domain, settings, useCloudData, configName) {
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
	} else {
		template.templateDataMerge(req, res, domain, settings, useCloudData, configName);
	}
};
