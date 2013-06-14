var cheerio = require("cheerio");
var azure = require('azure');
var fs = require("fs");
var xml = require("node-xml");

exports.templateDataMerge = function (processRequest, processResponse, domain, settings, useCloudData, configName) {
	var path = { params: [], fileName: "", templateName: "", templateConfigName: "", contentFileName: "", path: "", querystring: "", pagePath: "" };
	var response = { statusCode: 500, contentType: "text/html", template: "LOADING", templateConfig: "LOADING", content: "LOADING", masterPage: "LOADING", data: "", html: "" };
	response.html = "<h1>No Content Found for " + domain + ".</h1>";
	templateDir = "templates/" + domain.replace(".", "-");
	parseURL(processRequest, path, response);
	console.log("REQUEST: " + path.fileName);
	if (path.fileName == "publish.htm" && configName == "LOCAL") {
		var pub = require("./template-push-to-blob.js");
		pub.publishTemplates(processRequest, processResponse, path, response, domain, settings, useCloudData, configName);
	} else {
		if (path.fileName.indexOf(".htm") > 0) {
			load(processRequest, processResponse, path, response, domain, settings, useCloudData, configName);
		} else {
			//-- static files
			var filePath = null;
			var fileEncode = "utf8";
			if (path.path == "/client-scripts") {
				filePath = "./client-scripts/" + path.fileName;
				if (path.fileName.indexOf(".js") > 0) {
					response.contentType = "text/javascript";
				} else if (path.fileName.indexOf(".css") > 0) {
					response.contentType = "text/css";
				}
			} else if (path.fileName.indexOf(".css") > 0) {
				filePath = templateDir + "/css/" + path.fileName;
				response.contentType = "text/css";
			} else if (path.fileName.indexOf(".js") > 0) {
				filePath = templateDir + "/scripts/" + path.fileName;
				response.contentType = "text/javascript";
			} else if (path.fileName.indexOf(".gif") > 0) {
				filePath = templateDir + "/images/" + path.fileName;
				response.contentType = "image/gif";
				fileEncode = null;
			}
			//-- go get the file
			if (filePath != null) {
				fs.readFile(filePath, fileEncode, function (err, data) {
					console.log("RESPONSE: " + path.fileName);
					if (err) {
						processResponse.writeHead(404, { 'Content-Type': response.contentType, 'error': 'File Not Found.' });
						processResponse.end("OPPS");
					} else {
						processResponse.writeHead(200, { 'Content-Type': response.contentType });
						processResponse.end(data);
					}
				});
			} else {
				processResponse.writeHead(404, { 'Content-Type': response.contentType, 'error': 'File Not Found.' });
				processResponse.end("NONE");
			}
		}
	}
};

var load = function (processRequest, processResponse, path, response, domain, settings, useCloudData, configName) {
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
				merge(processRequest, processResponse, path, response);
				//-- do we have a master page
				var tQ = cheerio.load(response.template);
				blobService.getBlobToText(domain.replace(".", "-"), tQ("head").attr("masterPage") + ".htm", 
					function (error, text, blockBlob) {
						if (error == null) { response.masterPage = text;} else { response.masterPage = "NONE"; console.log("\n" + error); }
						merge(processRequest, processResponse, path, response);
					}
				);
			}
		);
		//-- load template config
		blobService.getBlobToText(domain.replace(".", "-"), path.templateConfigName, 
			function (error, text, blockBlob) {
				if (error == null) { response.templateConfig = text;} else { response.templateConfig = "NONE"; console.log("\n" + error); }
				merge(processRequest, processResponse, path, response);
			}
		);
		//-- load the content
		blobService.getBlobToText(domain.replace(".", "-"), path.contentFileName, 
			function (error, text, blockBlob) {
				if (error == null) { response.content = text;} else { response.content = "NONE"; console.log("\n" + error); }
				merge(processRequest, processResponse, path, response);
			}
		);
	} else {
		//-- load the template and master
		fs.readFile(templateDir + "/" + path.templateName, "utf8",
			function (err, data) {
				console.log("TEMPLATE: " + path.templateName);
				if (err) {
					response.template = "NONE";
					response.masterPage = "NONE";
					merge(processRequest, processResponse, path, response);
				} else {
					response.template = data;
					var tQ = cheerio.load(response.template);
					fs.readFile(templateDir + "/" + tQ("head").attr("masterPage") + ".htm", "utf8",
						function (err, data) {
							if (err) { response.masterPage = "NONE"; } else { response.masterPage = data; }
							merge(processRequest, processResponse, path, response);
						}
					);
				}
			}
		);
		//-- load template server side code behind script
		fs.readFile(templateDir + "/" + path.templateConfigName, "utf8",
			function (err, data) {
				console.log("TEMPLATE: " + path.templateConfigName);
				if (err) { response.templateConfig = "NONE"; } else { response.templateConfig = data; }
				merge(processRequest, processResponse, path, response);
			}
		);
		//-- load the content json file
		fs.readFile(templateDir + "/content/" + path.contentFileName, "utf8",
			function (err, data) {
				console.log("TEMPLATE: " + path.contentFileName);
				if (err) { response.content = "NONE"; } else { response.content = data; }
				merge(processRequest, processResponse, path, response);
			}
		);
	}
};

var merge = function (processRequest, processResponse, path, response) {
	var allLoaded = true;
	//-- reasons to wait
	if (response.template == "LOADING") {allLoaded = false; }
	if (response.templateConfig == "LOADING") { allLoaded = false; }
	if (response.content == "LOADING") { allLoaded = false; }
	if (response.masterPage == "LOADING") { allLoaded = false; }
	//-- we have all files
	if (allLoaded) {
		//-- put master and template together
		if (response.masterPage != "NONE") {
			var tQ = cheerio.load(response.template);
			response.html = response.masterPage.replace("<!--PageTemplate-->", tQ("body").html()).replace("<!--PageTemplateHead-->", tQ("head").html());
		} else {
			response.html = response.template;
		}
		//-- load template into cheerio, jquery style
		var $ = cheerio.load(response.html);
		//-- merge in content
		if (response.content != "NONE" && response.content != "LOADING") {
			mergeContent($, processRequest, processResponse, path, response);
		}
		//-- mearg in data
		mergeData($, processRequest, processResponse, path, response);

		//-- clear content edit
		var stringHTM = $.html();
		stringHTM = stringHTM.replace(/contenteditable="true"/g, " ");
		//-- all done
		processResponse.writeHead(response.statusCode, { 'Content-Type': response.contentType });
		processResponse.end(stringHTM);
	}
};

var mergeData = function ($, processRequest, processResponse, path, response) {

};

var mergeContent = function ($, processRequest, processResponse, path, response) {
	var content = null;
	try { content = JSON.parse(response.content); } catch (e) { console.log(e); }
	if (content != null) {
		//-- replace all content areas
		for (var id in content) {
			if ($("#" + id).length > 0) {
				$("#" + id).html(content[id]["text"]);
			}
		}
		//-- apply metadata
		if (content["metadata"] != null) {
			$("head title").html(content["metadata"]["pageTitle"]["text"]);
		}
	} else {
		console.log("No Content for " + path.fileName);
	}
};

var parseURL = function (processRequest, path, response) {
	var uriString = processRequest.url;
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
		path.path = "";
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
	path.contentFileName = path.templateName.replace(".htm", ".json");
};
