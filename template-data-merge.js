var cheerio = require("cheerio");
var azure = require('azure');
var fs = require("fs");
var xml = require("node-xml");

exports.templateDataMerge = function (req, domain, settings) {
	var path = parseURL(req.url);
	var templateDir = "templates/" + domain.replace(".", "-");
	var response = { statusCode: 200, contentType: "text/html", template: "", templateConfig: "", content: "", data: "", html: "<h1>No Content Found for " + domain + ".</h1>" };
	if (process.env.PORT != undefined) {
	} else {
		//-- load the template
		try { response.template = fs.readFileSync(templateDir + "/" + path.templateName, "utf8"); } catch (e) { response.template = ""; }
		//-- load template config
		try { response.templateConfig = fs.readFileSync(templateDir + "/" + path.templateConfigName, "utf8"); } catch (e) { response.templateConfig = ""; }
		//-- load the content
		try { response.content = fs.readFileSync(templateDir + "/content/" + path.contentFileName, "utf8"); } catch (e) { response.content = ""; }
	}
	//-- load template into cheerio, jquery style
	var $ = cheerio.load(response.template);



	//-- add processed html to response
	response.html = $.html();
	//-- debug
	//console.log(path);
	console.log(response.template);
	//console.log(response.content);

	//-- all done
	return response;
};

var parseURL = function (uriString) {
	var returnOBJ = { params: [], page: "", templateName: "", templateConfigName: "", contentFileName: "", path: "", querystring: "", pagePath: "" };
	//-- split at ?
	if (uriString.indexOf("?") > -1) {
		var tmp = uriString.split("?");
		returnOBJ.pagePath = tmp[0];
		returnOBJ.querystring = tmp[1];
	} else {
		returnOBJ.pagePath = uriString;
	}
	//-- split page from path
	if (returnOBJ.pagePath.indexOf("/") > -1) {
		var tmp = returnOBJ.pagePath.split("/");
		tmp[1] = tmp[1].toLowerCase();
		returnOBJ.templateName = tmp[1].indexOf(".htm") > 0 ? tmp[1] : tmp[1] + ".htm";
		returnOBJ.page = tmp[tmp.length - 1];
		for (var x = 1; x < tmp.length - 1; x++) { returnOBJ.path += "/" + tmp[x]; }
	} else {
		returnOBJ.path = "/";
		returnOBJ.page = returnOBJ.pagePath;
		returnOBJ.templateName = returnOBJ.pagePath;
	}
	//-- set config name
	returnOBJ.templateConfigName = returnOBJ.templateName.replace(".htm", ".xml");
	//-- set content file name
	returnOBJ.contentFileName = returnOBJ.templateName.replace(".htm", ".xml");

	return returnOBJ;
};
