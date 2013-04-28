var template = require('./template-data-merge.js');

exports.presenter = function (req, res) {
	//template.templateDataMerge();
	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.end("No HTM Found.");
	//console.log(req);
};
