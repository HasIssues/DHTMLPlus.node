var cheerio = require("cheerio");
var azure = require('azure');
var fs = require("fs");

exports.templateDataMerge = function (req, domain, settings) {
    var path = parseURL(req.url);
    console.log(path);
    var templateDir = "templates/" + domain.replace(".", "-");
    var response = { statusCode: 200, contentType: "text/html", html: "<h1>No Content Found for " + domain + ".</h1>" };
    //-- load the template
    var template = null;
    if (process.env.PORT != undefined) {
    } else {
        template = fs.readFileSync(templateDir + "/default.htm", "utf8");
    }
    //-- load template into cheerio, jquery style
    var $ = cheerio.load(template);



    //-- add processed html to response
    response.html = $.html();
    return response;
};

var parseURL = function (uriString) {
    var returnOBJ = { params: [], page: "", templateName: "", path: "", querystring: "", pagePath: "" };
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
        returnOBJ.page = tmp[tmp.length - 1];
    } else {
        returnOBJ.page = returnOBJ.pagePath;
    }

    return returnOBJ;
};
