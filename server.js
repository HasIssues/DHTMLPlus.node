var http = require('http');
var https = require('https');
var fs = require('fs');
var os = require("os");

//-- includes
var settings = require('./config.js');
var content = require('./presenter.js');

//-- vars
var machineName = os.hostname().toUpperCase();
var fullDomain = settings.config[machineName].domian;

//-- SSL options
var options = { pfx: fs.readFileSync('mddatacor.org.pfx'), passphrase: 'ThisIsAPassword' };

//-- HTTPS Server
//https.createServer(options, function (req, res) {
//	content.presenter(req, res);
//}).listen(443, fullDomain);

//-- HTTP Server for redirect
http.createServer(function (req, res) {
	content.presenter(req, res);
	//res.writeHead(302, { 'Content-Type': 'text/html', 'Location': 'https://' + fullDomain + '/' });
	//res.end('<a href="https://' + fullDomain + '/">Redirecting to Secure Site</a>');
	//console.log('Redirect to 443');
}).listen(80, fullDomain);

//-- Done
console.log(fullDomain + ' Web Server running.');
