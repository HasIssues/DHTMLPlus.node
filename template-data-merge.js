var cheerio = require("cheerio");
var azure = require('azure');
var fs = require("fs");
var xml = require("node-xml");

var path = { params: [], fileName: "", templateName: "", templateConfigName: "", contentFileName: "", path: "", querystring: "", pagePath: "" };
var response = { statusCode: 500, contentType: "text/html", template: "LOADING", templateConfig: "LOADING", content: "LOADING", masterPage: "LOADING", data: "", html: "" };
var req = null;
var res = null;
var templateDir = null;

exports.templateDataMerge = function (processRequest, processResponse, domain, settings, useCloudData, configName) {
	response.html = "<h1>No Content Found for " + domain + ".</h1>";
	templateDir = "templates/" + domain.replace(".", "-");
	req = processRequest;
	res = processResponse;
	parseURL(req.url);
	if (path.fileName == "publish.htm" && configName == "LOCAL") {
		var pub = require("./template-push-to-blob.js");
		pub.publishTemplates(processRequest, processResponse, domain, settings, useCloudData, configName);
	} else {
		if (path.fileName.indexOf(".htm") > 0) {
			load(domain, settings, useCloudData, configName);
		} else {
			if (path.fileName.indexOf(".css") > 0) {
				try {
					res.writeHead(200, { 'Content-Type': 'text/css' });
					res.end(fs.readFileSync(templateDir + "/css/" + path.fileName, "utf8"));
				} catch (e) {
					res.writeHead(404, { 'Content-Type': 'text/css', 'error': 'File Not Found.' });
					res.end("OPPS");
				}
			} else if (path.fileName.indexOf(".js") > 0) {
				try {
					res.writeHead(200, { 'Content-Type': 'text/javascript' });
					res.end(fs.readFileSync(templateDir + "/scripts/" + path.fileName, "utf8"));
				} catch (e) {
					res.writeHead(404, { 'Content-Type': 'text/javascript', 'error': 'File Not Found.' });
					res.end("OPPS");
				}
			} else {
				res.end("NONE");
			}
		}
	}
};
var load = function (domain, settings, useCloudData, configName) {
	response.statusCode = 200;
	if (useCloudData) {
		var blobService = null;
		if (configName == "LOCAL") {
			//-- do this to run local but use cloud storage
			var dev = require("./dev.js");
			blobService = azure.createBlobService(dev.devKeys["AZURE_STORAGE_ACCOUNT"], dev.devKeys["AZURE_STORAGE_ACCESS_KEY"]);
		} else {
			//-- get access keys from IIS in Azure 
			blobService = azure.createBlobService();
		}
		//-- load the template
		blobService.getBlobToText(domain.replace(".", "-"), path.templateName, 
			function (error, text, blockBlob) {
				if (error == null) { response.template = text;} else { response.template = "NONE"; console.log("\n" + error); }
				merge();
			}
		);
		//-- load template config
		blobService.getBlobToText(domain.replace(".", "-"), path.templateConfigName, 
			function (error, text, blockBlob) {
				if (error == null) { response.templateConfig = text;} else { response.templateConfig = "NONE"; console.log("\n" + error); }
				merge();
			}
		);
		//-- load the content
		blobService.getBlobToText(domain.replace(".", "-"), path.contentFileName, 
			function (error, text, blockBlob) {
				if (error == null) { response.content = text;} else { response.content = "NONE"; console.log("\n" + error); }
				merge();
			}
		);
	} else {
		//-- load the templates
		try {
			response.template = fs.readFileSync(templateDir + "/" + path.templateName, "utf8"); 
			//-- do we have a master page
			var tQ = cheerio.load(response.template);
			try { response.masterPage = fs.readFileSync(templateDir + "/" + tQ("head").attr("masterPage") + ".htm", "utf8"); } catch (e) { response.masterPage = "NONE"; }
			//-- put master and template together
			if (response.masterPage != "NONE") {
				$ = cheerio.load(response.masterPage);
				response.html = response.masterPage.replace("<!--PageTemplate-->", tQ("body").html()).replace("<!--PageTemplateHead-->", tQ("head").html());
			} else {
				response.html = response.template;
			}
		} catch (e) {
			response.template = "NONE";
		}
		//-- load template server side code behind script
		try { response.templateConfig = fs.readFileSync(templateDir + "/" + path.templateConfigName, "utf8"); } catch (e) { response.templateConfig = "NONE"; }
		//-- load the content json file
		try { response.content = fs.readFileSync(templateDir + "/content/" + path.contentFileName, "utf8"); } catch (e) { response.content = "NONE"; }
		merge();
	}
};

var merge = function () {
	var allLoaded = true;
	//-- reasons to wait
	if (response.template == "LOADING") {allLoaded = false; }
	if (response.templateConfig == "LOADING") { allLoaded = false; }
	if (response.content == "LOADING") { allLoaded = false; }
	//-- we have all files
	if (allLoaded) {
		//-- load template into cheerio, jquery style
		var $ = cheerio.load(response.html);
		//-- merge in content
		if (response.content != "NONE") {mergeContent($); }

		//-- all done
		res.writeHead(response.statusCode, { 'Content-Type': response.contentType });
		res.end($.html());
	}
};

var mergeContent = function ($) {
	var content = null;
	try { content = JSON.parse(response.content); } catch (e) { console.log(e); }
	if (content != null) {
		//-- replace all content areas
		for (var id in content) {
			if ($("#" + id).length > 0) {
				$("#" + id).html(content[id]["text"]);
			}
		}
	}
	//-- apply metadata
	if (content["metadata"] != null) {
		$("head title").html(content["metadata"]["text"]);
	}
};

var parseURL = function (uriString) {
	//-- split at ?
	if (uriString.indexOf("?") > -1) {
		var tmp = uriString.split("?");
		path.pagePath = tmp[0];
		path.querystring = tmp[1];
	} else {
		path.pagePath = uriString;
	}
	//-- split page from path
	if (path.pagePath.indexOf("/") > -1) {
		var tmp = path.pagePath.split("/");
		path.templateName = tmp[tmp.length - 1].indexOf(".htm") > 0 ? tmp[tmp.length - 1] : tmp[tmp.length - 1] == "" ? "home.htm" : tmp[tmp.length - 1] + ".htm";
		path.fileName = tmp[tmp.length - 1] == "" ? "home.htm" : tmp[tmp.length - 1];
		for (var x = 1; x < tmp.length - 1; x++) { path.path += "/" + tmp[x]; }
	} else {
		path.path = "/";
		path.fileName = path.pagePath;
		path.templateName = path.pagePath;
	}
	//-- set config name
	path.templateConfigName = path.templateName.replace(".htm", ".js");
	//-- set content file name
	path.contentFileName = path.templateName.replace(".htm", ".js");
};
