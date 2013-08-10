var local = require("./local.js");
var fs = require("fs");
var ffmpeg = require('fluent-ffmpeg');
var util = require("util");

exports.streamMP4 = function (processRequest, processResponse, path, response, domain, settings, useCloudData, configName) {
	var path = local.video.paths[path.path.substring(1)] +"/" + unescape(path.fileName);
	if (fs.existsSync(path)) {
		var stat = fs.statSync(path);
		var total = stat.size;
		if (processRequest.headers['range']) {
			var range = processRequest.headers.range;
			var parts = range.replace(/bytes=/, "").split("-");
			var partialstart = parts[0];
			var partialend = parts[1];
 
			var start = parseInt(partialstart, 10);
			var end = partialend ? parseInt(partialend, 10) : total-1;
			var chunksize = (end-start)+1;
			console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
 
			var file = fs.createReadStream(path, {start: start, end: end});
			processResponse.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
			file.pipe(processResponse);
		} else {
			console.log('ALL: ' + total);
			processResponse.writeHead(200, { 'Content-Length': total, 'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });
			fs.createReadStream(path).pipe(processResponse);
		}
	} else {
		console.log("Video Not Found: " + path);
		processResponse.writeHead(404, "Video Not Found");
		processResponse.end("Video Not Found");
	}
};

exports.videoStream = function (processRequest, processResponse, path, response, domain, settings, useCloudData, configName) {
	port = local.localKeys["port"];
	var streamFormat = "mp4";
	var contentType = "video/" + streamFormat;
	var sourceFile = "M:"+ path.path +"/" + unescape(path.fileName);
	if (fs.existsSync(sourceFile)) {
		processResponse.writeHead(200, { 'Content-Type':  contentType, 'Accept-Ranges': 'bytes' });
		var proc = new ffmpeg({ source: sourceFile, timeout: 0, priority: 5, logger: null, nolog: false }, function(error) {
			if(error) { console.log("Video Error: " + sourceFile);}
		})
		.onProgress(function(progress) {
			//console.log(progress);
		})
		.onCodecData(function(codecinfo) {
			//console.log(codecinfo);
		})
		.toFormat(streamFormat)
		.keepPixelAspect(true)
		.addOption("-vtag", streamFormat);
		if (path.params.bitrate != null) { proc.withVideoBitrate(path.params.bitrate); } else { proc.withVideoBitrate(468); }
		if (path.params.fps != null) { proc.withFpsInput(path.params.fps); }
		//.withAspect('16:9')
		if (path.params.size != null) {
			if (path.params.size == "s") { proc.withSize(unescape("384x?")); }
			else if (path.params.size == "m") { proc.withSize(unescape("480x?")); }
			else if (path.params.size == "l") { proc.withSize(unescape("852x?")); }
			else { proc.withSize(unescape(path.params.size)); }
		} else {
			proc.withSize(unescape("384x?"));
		}
		proc.writeToStream(processResponse, function(retcode, error) {
			if(error) {
				console.log("Video Stream Error: " + sourceFile);
				//processResponse.end("Video Stream Error: " + error);
			} else {
				console.log(sourceFile + " has been streamed succesfully");
				processResponse.end();
			}
		});
	} else {
		console.log("Video Not Found: " + sourceFile);
		processResponse.writeHead(404, "Video Not Found");
		processResponse.end("Video Not Found");
	}
};