var http = require('http');
var azure = require('azure');
var local = require("./local.js");
var fs = require("fs");
var uuid = require("node-uuid");

exports.update = function (tableService, sourceFile, basePath, pathType, processRequest, processResponse, path, response, domain, settings, useCloudData, configName) {
	//-- check if the movie is in the database
	var query = azure.TableQuery.select().from("movies").where("PartitionKey eq ?", "movie").and("file eq ?", sourceFile);
	tableService.queryEntities(query, function(error, entities){
		if (error) {
			console.log("Query Table: " + error);
		} else {
			if (entities.length > 0) {
				//processResponse.write(sourceFile + " already in azure.<br/>\n");
			} else {
				//-- define search stuff
				var searchTitle = "";
				var searchYear = "";
				if (sourceFile.indexOf("(") > 0) {
					var tmpStr = sourceFile.split("(");
					searchTitle = tmpStr[0].trim();
					searchYear = tmpStr[1].split(")")[0].trim();
				} else {
					searchTitle = sourceFile;
					searchYear = "";
				}
				//-- find with themoviedb api
				var options = {
					host: "api.themoviedb.org",
					path: "/3/search/movie?api_key=" + local.video.settings.tmdbApiKey + "&query=" + unescape(searchTitle) + "&year=" + searchYear,
					port: 80,
					method: "GET",
					headers: {"content-type": "application/json", "accept": "application/json"}
				};
				http.get(options, function(response) {
					response.on("data", function (data) {
						try {
							var searchResult = JSON.parse(data);
							if (searchResult["total_results"] <= 0) {
								processResponse.write("TheMovieDb.org search for " + searchTitle + ":" + searchYear + " found 0 matches.<br/>\n");
							} else {
								processResponse.write("TheMovieDb.org search for " + searchTitle + ":" + searchYear + " found " + searchResult["total_results"] + " matches.<br/>\n");
								var matchResult = searchResult["results"][0];
								processResponse.write("GET Movie Id " + matchResult.id + "<br/>\n");
								var options2 = {
									host: "api.themoviedb.org",
									path: "/3/movie/" + matchResult.id + "?api_key=" + local.video.settings.tmdbApiKey,
									port: 80,
									method: "GET",
									headers: {"content-type": "application/json", "accept": "application/json"}
								};
								http.get(options2, function(response) {
									var mData = "";
									response.on("data", function (d) { try { mData += d.toString();} catch (e) { } });
									response.on("end", function () {
										var match = JSON.parse(mData);
										var movie = JSON.parse(JSON.stringify(local.video.settings.template));
										movie.RowKey = uuid();
										movie.TMDb = match.id;
										movie.filePath = basePath;
										movie.file = sourceFile;
										movie.update = false;
										movie.own = false;
										movie.MyDb = "0";
										movie.adult = "adult" in match ? match.adult : "";
										movie.backdrop = "backdrop_path" in match ? match.backdrop_path : "";
										movie.collection = match.belongs_to_collection == null ? JSON.stringify({}) : JSON.stringify(match.belongs_to_collection);
										movie.name = "title" in match ? match.title.replace("'",escape("'")) : "";
										movie.nameSort = "title" in match ? match.title.replace("'","") : "";
										movie.popularity = "vote_average" in match ? match.vote_average : "";
										movie.released = "release_date" in match ? match.release_date : "";
										movie.poster= "poster_path" in match ? match.poster_path : "";
										movie.IMDb = "imdb_id" in match ? match.imdb_id : "";
										movie.type = pathType;
										movie.overview = "overview" in match ? match.overview.replace("'",escape("'")).replace("\"",escape("\"")) : "N/A";
										movie.rating = "rating" in match ? match.rating : "";
										movie.certification = "certification" in match ? match.certification : "";
										movie.url = "url" in match ? match.url : "";
										movie.runtime = "runtime" in match ? match.runtime : "0";
										movie.tagline = "tagline" in match ? match.tagline.replace("'",escape("'")).replace("\"",escape("\"")) : "";
										movie.homepage = "homepage" in match ? match.homepage : "";
										movie.categories = JSON.stringify({});
										movie.keywords = JSON.stringify({});
										movie.cast = JSON.stringify({});
										movie.backdrops= JSON.stringify({});
										//-- add movie to azure
										//try {
											tableService.insertEntity("movies", movie, function(error){
												if(error) {
													processResponse.write("Azure Insert Error: " + error + "<br/>\n");
													processResponse.write(movie);
													processResponse.write("<br/>\n");
												} else {
													processResponse.write("Azure Added Movie [" + movie.RowKey + "]:" + movie.file + "<br/>\n");
												}
											});
										//} catch (e) {
										//	console.log(movie);
										//}
									});
								}).on("error", function (err) { processResponse.write("TMDb Movie Error: " + err + "<br/>\n"); });
							}
						} catch (e) {
							processResponse.write("FAIL:" + basePath + "/" + sourceFile + "<br/>\n");
							processResponse.write(data.toString() + "<br/>\n");
						}
					});
				}).on("error", function (err) { processResponse.write("TMDb Search Error: " + err.message + "<br/>\n"); });
			}
		}
	});
};

exports.search = function (processRequest, processResponse, path, response, domain, settings, useCloudData, configName) {

};
