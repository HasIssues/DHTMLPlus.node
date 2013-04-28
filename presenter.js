var template = require('./template-data-merge.js');

exports.presenter = function (req, res, domain) {
    var requestHost = req.headers.host.toLowerCase(); 
    var requestReferer = req.headers.referer;
    var requestHttpVersion = req.httpVersion;
    var requestURL = req.url;
    var requestMethod = req.method;

	//template.templateDataMerge();
	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.end("No Content Found for " + domain + ".");
	//console.log(req);
};
