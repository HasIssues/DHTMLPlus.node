
exports.contentManagement = function (processRequest, processResponse, path, response, domain, settings, useCloudData, configName) {


	processResponse.writeHead(200, { 'Content-Type': response.contentType });
	processResponse.end("OK");
};