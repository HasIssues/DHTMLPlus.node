var cheerio = require("cheerio");
var azure = require('azure');
var fs = require("fs");
var xml = require("node-xml");

var path = { params: [], page: "", templateName: "", templateConfigName: "", contentFileName: "", path: "", querystring: "", pagePath: "" };
var response = { statusCode: 200, contentType: "text/html", template: "LOADING", templateConfig: "LOADING", content: "LOADING", data: "", html: "" };
var req = null;
var res = null;

exports.templateDataMerge = function (processRequest, processResponse, domain, settings) {
	response.html = "<h1>No Content Found for " + domain + ".</h1>";
	req = processRequest;
	res = processResponse;
	parseURL(req.url);
	if (process.env.PORT != undefined) {
		var blobService = azure.createBlobService("hasissues","Yc+U7cFzCCw/w94NYvxCuLFl/C3tgFdoTwDqGdi2JJd8zp06i6NfVa6xX+W/5PGEDJHaXK7k1178tJdvdwNKdg==");
		//-- load the template
		blobService.getBlobToText(domain.replace(".", "-"), path.templateName, 
			function (error, text, blockBlob, response) {
				if (error == null) { response.template = text;} else { response.template = "NONE"; console.log(error); }
				merge();
			}
		);
		//-- load template config
		//-- load the content
	} else {
		var templateDir = "templates/" + domain.replace(".", "-");
		//-- load the template
		try { response.template = fs.readFileSync(templateDir + "/" + path.templateName, "utf8"); } catch (e) { response.template = "NONE"; }
		//-- load template config
		try { response.templateConfig = fs.readFileSync(templateDir + "/" + path.templateConfigName, "utf8"); } catch (e) { response.templateConfig = "NONE"; }
		//-- load the content
		try { response.content = fs.readFileSync(templateDir + "/content/" + path.contentFileName, "utf8"); } catch (e) { response.content = "NONE"; }
		merge();
	}
};

var merge = function () {
	//-- load template into cheerio, jquery style
	var $ = cheerio.load(response.template);
	//-- add processed html to response
	response.html = $.html();
	//-- debug
	//console.log(path);
	//console.log(response.template);
	//console.log(response.content);

	//-- all done
	res.writeHead(response.statusCode, { 'Content-Type': response.contentType });
	res.end(response.template);
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
		tmp[1] = tmp[1];
		path.templateName = tmp[1].indexOf(".htm") > 0 ? tmp[1] : tmp[1] + ".htm";
		path.page = tmp[tmp.length - 1];
		for (var x = 1; x < tmp.length - 1; x++) { path.path += "/" + tmp[x]; }
	} else {
		path.path = "/";
		path.page = path.pagePath;
		path.templateName = path.pagePath;
	}
	//-- set config name
	path.templateConfigName = path.templateName.replace(".htm", ".xml");
	//-- set content file name
	path.contentFileName = path.templateName.replace(".htm", ".xml");
};
