var fs = require("fs");
var vm = require("vm");

exports.returnJSON = function (processRequest, processResponse, domain, settings, useCloudData, configName, userName, local) {
    processResponse.writeHead(200, { "Content-Type": "text/json" });
    var route = { templateDir: "", path: "", params: {} };
    var returnJson = {};
    route.templateDir = settings.templates.path + domain.replace(/\./g, "-");
    var relativePath = decodeURIComponent(processRequest.url);
    if (relativePath.substring(0,1) == "/") { relativePath = relativePath.substring(1); }
    
    //-- get route info
    if (relativePath.indexOf("?") > -1) {
        var tmp = relativePath.split("?");
        route.path = tmp[0];
        var tmpParms = tmp[1].split(";");
        var append = "";
        for (var x = 0; x < tmpParms.length; x++) {
            var tmpP = tmpParms[x].split("=");
            append += ",{\"" + tmpP[0] + "\":\"" + tmpP[1] + "\"}";
        }
        route.params = JSON.parse(append.substring(1));
    } else {
        route.path = relativePath;
        route.params = {};
    }
    console.log("API (" + domain + "): " + JSON.stringify(route));
    
    //-- execute codebehind
    fs.readFile(route.templateDir + "/" + route.path + ".js", "utf8",
        function (err, data) {
            code = vm.createScript(data);
            code.runInThisContext();
            var dataServices = null; //require("./data-services.js");
            codebehind(route, local, fs, dataServices, processResponse);
        }
    );
    

};

