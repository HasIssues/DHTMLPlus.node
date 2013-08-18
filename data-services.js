var azure = require("azure");
var local = require("./local.js");

exports.connectAzureTableService = function () {
	return azure.createTableService(local.video.settings["AZURE_STORAGE_ACCOUNT"], local.video.settings["AZURE_STORAGE_ACCESS_KEY"]);
};
exports.azureTableQuery = function () {
	return azure.TableQuery;
};
