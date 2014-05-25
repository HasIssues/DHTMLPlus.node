var azure = require("azure");

exports.connectAzureTableService = function (local) {
	return azure.createTableService(local.video.settings["AZURE_STORAGE_ACCOUNT"], local.video.settings["AZURE_STORAGE_ACCESS_KEY"]);
};
exports.azureTableQuery = function () {
	return azure.TableQuery;
};
