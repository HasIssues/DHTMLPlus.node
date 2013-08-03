var cheerio = require("cheerio");
var azure = require('azure');
var fs = require("fs");
var xml = require("node-xml");
var vm = require("vm");

var verboseConsole = false;

exports.templateDataMerge = function (processRequest, processResponse, domain, settings, useCloudData, configName) {
	var path = { params: null, fileName: "", templateName: "", templateConfigName: "", contentFileName: "", path: "", querystring: "", pagePath: "", isBlog: false };
	var response = { statusCode: 500, contentType: "text/html", template: "LOADING", templateConfig: "LOADING", content: "LOADING", masterPage: "LOADING", codebehind: "LOADING", data: "", html: "" };
	response.html = "<h1>No Content Found for " + domain + ".</h1>";
	templateDir = "templates/" + domain.replace(".", "-");
	parseURL(processRequest, path, response);
	if (path.fileName == "publish.htm" && configName == "LOCAL") {
		var pub = require("./template-push-to-blob.js");
		pub.publishTemplates(processRequest, processResponse, path, response, domain, settings, useCloudData, configName);
	} else {
		if (path.fileName.endsWith(".htm") && !path.path.startsWith("/preview")) {
			console.log("REQUEST: " + domain + processRequest.url);
			load(processRequest, processResponse, path, response, domain, settings, useCloudData, configName);
		} else if (path.fileName.endsWith(".content")) {
			var cm = require("./content-management.js");
			console.log("CONTENT EDIT: " + domain + processRequest.url);
			cm.contentManagement(processRequest, processResponse, path, response, domain, settings, useCloudData, configName);
		} else {
			if (verboseConsole) { console.log("REQUEST: " + path.fileName); }
			//-- static files
			var filePath = null;
			var fileEncode = "utf8";
			if (path.fileName.indexOf(".css") > 0) {
				if (path.path.startsWith("/preview")) {
					filePath = "." + path.path + "/" + path.fileName;
				} else {
					filePath = "css/" + path.fileName;
				}
				response.contentType = "text/css";
			} else if (path.fileName.indexOf(".htm") > 0 && path.path.startsWith("/preview")) {
				filePath = "." + path.path + "/" + path.fileName;
				response.contentType = "text/html";
			} else if (path.fileName.indexOf(".js") > 0) {
				if (path.path.startsWith("/preview")) {
					filePath = "." + path.path + "/" + path.fileName;
				} else {
					filePath = "scripts/" + path.fileName;
				}
				response.contentType = "text/javascript";
			} else if (path.fileName.indexOf(".gif") > 0) {
				if (path.path.startsWith("/preview")) {
					filePath = "." + path.path + "/" + path.fileName;
				} else {
					filePath = "images/" + path.fileName;
				}
				response.contentType = "image/gif";
				fileEncode = null;
			} else if (path.fileName.indexOf(".png") > 0) {
				if (path.path.startsWith("/preview")) {
					filePath = "." + path.path + "/" + path.fileName;
				} else {
					filePath = "images/" + path.fileName;
				}
				response.contentType = "image/png";
				fileEncode = null;
			} else if (path.fileName.indexOf(".jpg") > 0) {
				if (path.path.startsWith("/preview")) {
					filePath = "." + path.path + "/" + path.fileName;
				} else {
					filePath = "images/" + path.fileName;
				}
				response.contentType = "image/jpg";
				fileEncode = null;
			}
			//-- go get the file
			if (filePath != null) {
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
					blobService.getBlobToStream(domain.replace(".", "-"), filePath, processResponse,
						function (err) {
							if (err) {
								console.log(filePath + ": " + err);
							} else {
								if (verboseConsole) { console.log("BLOB: " + filePath); }
							}
							processResponse.end();
						}
					);
				} else {
					if (!filePath.startsWith(".")) { filePath = templateDir + "/" + filePath; }
					fs.readFile(filePath, fileEncode, function (err, data) {
						if (verboseConsole) { console.log("RESPONSE: " + filePath); }
						if (err) {
							processResponse.writeHead(404, { 'Content-Type': response.contentType, 'error': 'File Not Found.' });
							processResponse.end("OPPS");
						} else {
							processResponse.writeHead(200, { 'Content-Type': response.contentType });
							processResponse.end(data);
						}
					});
				}
			} else {
				processResponse.writeHead(404, { 'Content-Type': response.contentType, 'error': 'File Not Found.' });
				processResponse.end("404");
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
				merge(processRequest, processResponse, path, response, configName);
				var tQ = cheerio.load(response.template);
				//-- do we have a master page
				if (tQ("head").attr("masterpage") != null) {
					if (verboseConsole) { console.log(tQ("head").attr("masterpage") + ".htm Master Page for " + path.templateName); }
					blobService.getBlobToText(domain.replace(".", "-"), tQ("head").attr("masterpage") + ".htm", 
						function (error, text, blockBlob) {
							if (error == null) { response.masterPage = text;} else { response.masterPage = "NONE"; console.log("\n"  + tQ("head").attr("masterpage") + ".htm" + "\n" + error); }
							merge(processRequest, processResponse, path, response);
						}
					);
				} else {
					if (verboseConsole) { console.log("No Master Page for " + path.templateName); }
					response.masterPage = "NONE";
					merge(processRequest, processResponse, path, response, configName);
				}
				//-- do we have codebehind
				if (tQ("head").attr("codebehind") == "true") {
					blobService.getBlobToText(domain.replace(".", "-"), path.templateName.replace(".htm", ".js"), 
						function (error, text, blockBlob) {
							if (error == null) { response.codebehind = text;} else { response.codebehind = "NONE"; console.log("\n"  + path.templateName.replace(".htm", ".js") + "\n" + error); }
							merge(processRequest, processResponse, path, response, configName);
						}
					);
				} else {
					response.codebehind = "NONE";
					merge(processRequest, processResponse, path, response, configName);
				}
			}
		);
		//-- load template config
		blobService.getBlobToText(domain.replace(".", "-"), path.templateConfigName, 
			function (error, text, blockBlob) {
				if (error == null) { response.templateConfig = text;} else { response.templateConfig = "NONE"; console.log("\n" + path.templateConfigName + "\n" + error); }
				merge(processRequest, processResponse, path, response, configName);
			}
		);
		//-- load the content
		var contentFilePath = null;
		if (path.isBlog) {
			contentFilePath =  path.path.substring(1) + "/" + path.contentFileName;
		} else {
			contentFilePath =  "content/" + path.contentFileName;
		}
		blobService.getBlobToText(domain.replace(".", "-"), contentFilePath, 
			function (error, text, blockBlob) {
				if (error == null) { response.content = text;} else { response.content = "NONE"; console.log("\n" + "content/" + path.contentFileName + "\n" + error); }
				merge(processRequest, processResponse, path, response, configName);
			}
		);
	} else {
		//-- load the template and master
		fs.readFile(templateDir + "/" + path.templateName, "utf8",
			function (err, data) {
				if (verboseConsole) { console.log("TEMPLATE: " + path.templateName); }
				if (err) {
					response.template = "NONE";
					response.masterPage = "NONE";
					merge(processRequest, processResponse, path, response, configName);
				} else {
					response.template = data;
					var tQ = cheerio.load(response.template);
					//-- do we have a master page
					if (tQ("head").attr("masterpage") != null) {
						fs.readFile(templateDir + "/" + tQ("head").attr("masterpage") + ".htm", "utf8",
							function (err, data) {
								if (err) { response.masterPage = "NONE"; } else { response.masterPage = data; }
								merge(processRequest, processResponse, path, response, configName);
							}
						);
					} else {
						response.masterPage = "NONE";
						merge(processRequest, processResponse, path, response, configName);
					}
					//-- do we have codebehind
					if (tQ("head").attr("codebehind") == "true") {
						fs.readFile(templateDir + "/" + path.templateName.replace(".htm", ".js"), "utf8",
							function (err, data) {
								if (err) { response.codebehind = "NONE"; } else { response.codebehind = data; }
								merge(processRequest, processResponse, path, response, configName);
							}
						);
					} else {
						response.codebehind = "NONE";
						merge(processRequest, processResponse, path, response, configName);
					}
				}
			}
		);
		//-- load template server side code behind script
		fs.readFile(templateDir + "/" + path.templateConfigName, "utf8",
			function (err, data) {
				if (verboseConsole) { console.log("TEMPLATE: " + path.templateConfigName); }
				if (err) { response.templateConfig = "NONE"; } else { response.templateConfig = data; }
				merge(processRequest, processResponse, path, response, configName);
			}
		);
		//-- load the content json file
		var contentFile = null;
		if (path.isBlog) {
			contentFile =  path.path + "/" + path.contentFileName;
		} else {
			contentFile =  "/content/" + path.contentFileName;
		}
		fs.readFile(templateDir + contentFile, "utf8",
			function (err, data) {
				if (verboseConsole) { console.log("TEMPLATE: " + path.contentFileName); }
				if (err) { response.content = "NONE"; } else { response.content = data; }
				merge(processRequest, processResponse, path, response, configName);
			}
		);
	}
};

var merge = function (processRequest, processResponse, path, response, configName) {
	var allLoaded = true;
	//-- reasons to wait
	if (response.template == "LOADING") {allLoaded = false; }
	if (response.templateConfig == "LOADING") { allLoaded = false; }
	if (response.content == "LOADING") { allLoaded = false; }
	if (response.masterPage == "LOADING") { allLoaded = false; }
	if (response.codebehind == "LOADING") { allLoaded = false; }
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
		//-- execute codebehind
		if (response.codebehind != "NONE" && response.codebehind != "LOADING") {
			code = vm.createScript(response.codebehind);
			code.runInThisContext();
			codebehind($, path, response);
		}
		//-- mearg in data
		mergeData($, processRequest, processResponse, path, response);
		//-- content edit
		var stringHTM;
		if (configName == "LOCAL") {
			$("head").append("<script type=\"text/javascript\" src=\"/DHTMLPlus-content-edit.js\"></script>");
			$("head").append("<link rel=\"stylesheet\" type=\"text/css\" href=\"/DHTMLPlus-content-edit.css\"/>");
		} else {
			$("*").removeAttr("contentEditable");
		}
		//-- all done
		processResponse.writeHead(response.statusCode, { 'Content-Type': response.contentType });
		processResponse.end("<!DOCTYPE HTML>\n" + $.html() + "Running Node Version " + process.versions.node);
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
		if (verboseConsole) { console.log("No Content for " + path.fileName); }
	}
};

var parseURL = function (processRequest, path, response) {
	//http://preview.hasissues.com/blog/Mark.Hebert/2010/11/basic-SEO/
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
		if (tmp[1] == "blog" && tmp[2] == "tags") {
			path.templateName = "blog-tag-list.htm";
			path.fileName = "blog-tag-list.htm";
			for (var x = 1; x < tmp.length - 2; x++) { path.path += "/" + tmp[x]; }
			path.contentFileName = "blog_tags_" + tmp[tmp.length - 2] + "_blog-tag-list.json";
		} else if (tmp[1] == "blog") {
			path.isBlog = true;
			path.templateName = "blog.htm";
			path.fileName = "blog.htm";
			for (var x = 1; x < tmp.length - 2; x++) { path.path += "/" + tmp[x]; }
			path.contentFileName = tmp[tmp.length - 2] + ".json";
		} else {
			path.templateName = tmp[tmp.length - 1].indexOf(".htm") > 0 ? tmp[tmp.length - 1] : tmp[tmp.length - 1] == "" ? "home.htm" : tmp[tmp.length - 1] + ".htm";
			path.fileName = tmp[tmp.length - 1] == "" ? "home.htm" : tmp[tmp.length - 1];
			for (var x = 1; x < tmp.length - 1; x++) { path.path += "/" + tmp[x]; }
			path.contentFileName = path.templateName.replace(".htm", ".json");
		}
	} else {
		path.path = "/";
		path.fileName = path.pagePath;
		path.templateName = path.pagePath;
	}
	//-- process querystring
	var paramString = "{";
	if (path.querystring.length > 0) {
		var tmpQ = path.querystring.split("&");
		for (var q = 0; q < tmpQ.length; q++) {
			var tmpP = tmpQ[q].split("=");
			if (tmpP[1] == true || tmpP[1] == "false") {
				paramString += "\"" + tmpP[0] +"\":" + tmpP[1] + ",";
			} else {
				paramString += "\"" + tmpP[0] +"\":\"" + tmpP[1] + "\",";
			}
		}
		if (paramString.endsWith(",")) { paramString = paramString.substring(0, paramString.length - 1); }
	}
	paramString += "}";
	path.params = JSON.parse(paramString);
	//-- set config name
	path.templateConfigName = path.templateName.replace(".htm", ".js");
};

String.prototype.endsWith = function(suffix) { return this.indexOf(suffix, this.length - suffix.length) !== -1; };
String.prototype.startsWith = function(str) {return (this.match("^"+str)==str)};
String.prototype.trim = function() { return (this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "")) };
String.prototype.toProperCase = function() {return this.toLowerCase().replace(/^(.)|\s(.)/g,function($1) { return $1.toUpperCase(); });};

