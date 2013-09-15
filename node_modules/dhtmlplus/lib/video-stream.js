var fs = require("fs");
var ffmpeg = require('fluent-ffmpeg');
var util = require("util");
var index = require("./video-index.js");

exports.streamMP4 = function (processRequest, processResponse, path, response, domain, settings, useCloudData, configName, local) {
	var sourceFile = local.video.paths[path.path.substring(1)] +"/" + unescape(path.fileName);
	if (fs.existsSync(sourceFile)) {
		var stat = fs.statSync(sourceFile);
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
 
			var file = fs.createReadStream(sourceFile, {start: start, end: end});
			processResponse.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
			file.pipe(processResponse);
		} else {
			console.log('ALL: ' + total);
			processResponse.writeHead(200, { 'Content-Length': total, 'Accept-Ranges': 'bytes', 'Content-Type': 'video/mp4' });
			fs.createReadStream(sourceFile).pipe(processResponse);
		}
	} else {
		console.log("Video Not Found: " + sourceFile);
		processResponse.writeHead(404, "Video Not Found");
		processResponse.end("Video Not Found");
	}
};

exports.transcodeStream = function (processRequest, processResponse, path, response, domain, settings, useCloudData, configName, local) {
	//-- https://ustream.zendesk.com/entries/22962268-Encoding-Specs-and-Stream-Settings#video content
	var streamFormat = "webm";
	var sourceFile = local.video.paths[path.path.substring(1)] +"/" + unescape(path.fileName);
	var videoInfo = null;
	if (fs.existsSync(sourceFile)) {
		processResponse.writeHead(200, { "Content-Type": "video/" + streamFormat, "Accept-Ranges": "none" });
		var proc = new ffmpeg({ source: sourceFile, timeout: 0, priority: 5, logger: null, nolog: false }, function(error) {
			if(error) { console.log("Video Error: " + sourceFile + "\n" + error);}
		})
		.onProgress(function(progress) {
			//console.log(progress);
		})
		.onCodecData(function(codecinfo) {
			videoInfo = codecinfo;
			console.log(videoInfo);
		})
		.toFormat(streamFormat)
		.keepPixelAspect(true)
		.addOption("-vtag", streamFormat);
		//proc.withAspect("16:9");
		if (path.params.fps != null) { proc.withFpsInput(path.params.fps); }
		if (path.params.size != null) {
			if (path.params.size == "small") { proc.withSize("256x144"); proc.withVideoBitrate(400); }
			else if (path.params.size == "low") { proc.withSize("384x216"); proc.withVideoBitrate(500); }
			else if (path.params.size == "med") { proc.withSize("720x480"); proc.withVideoBitrate(1000); }
			else if (path.params.size == "high") { proc.withSize("960x540"); proc.withVideoBitrate(1500); }
			else if (path.params.size == "hd") { proc.withSize("1280x720"); proc.withVideoBitrate(1000); }
			else { proc.withSize(unescape(path.params.size)); }
		} else {
			proc.withSize("640x360");
		}
		if (path.params.bitrate != null) { proc.withVideoBitrate(path.params.bitrate); }
		proc.writeToStream(processResponse, function(retcode, error) {
			if(error) {
				console.log("Video Stream Error: " + sourceFile);
				if (videoInfo != null) {
					console.log(videoInfo);
				} else {
					console.log(error);
				}
				processResponse.end();
			} else {
				//console.log(sourceFile + " has been streamed succesfully");
				//processResponse.end();
			}
		});
	} else {
		console.log("Video Not Found: " + sourceFile);
		processResponse.writeHead(404, "Video Not Found");
		processResponse.end("Video Not Found");
	}
};