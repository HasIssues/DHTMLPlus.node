var http = require("http");
var https = require("https");
var fs = require("fs");
var uuid = require("node-uuid");

var movieFiles = JSON.parse(fs.readFileSync("movies.json", "utf8"));

exports.getList = function (req, res, domain, settings, useCloudData, configName, userName, local) {
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE", "Access-Control-Allow-Headers": "Content-Type" });
    res.end(JSON.stringify(movieFiles));
};

exports.sortDatabase = function (req, res, domain, settings, useCloudData, configName, userName, local) {
    movieFiles.sort(sortByName);
    fs.writeFile("movies.json", JSON.stringify(movieFiles, null, 2), function (err) { console.log(err); });
    res.writeHead(200, { "Content-Type": "text/html", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE", "Access-Control-Allow-Headers": "Content-Type" });
    res.end(movieFiles.length + " SORTED BY NAME.");
};

exports.updateDatabase = function (req, res, domain, settings, useCloudData, configName, userName, local) {
    res.writeHead(200, { "Content-Type": "text/html", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE", "Access-Control-Allow-Headers": "Content-Type" });
    var fileCount = 0;
    if ("video" in local) {
        if (local.video.settings.domains[0] == domain) {
            for (var attr in local.video.paths) {
                var pathType = local.video.pathTypes[attr];
                var files = fs.readdirSync(local.video.paths[attr]);
                for (var i in files) {
                    var sourceFile = files[i];
                    var skipFile = false;
                    for (x = 0; x < movieFiles.length; x++) {
                        if (movieFiles[x].file == sourceFile) {
                            skipFile = true;
                        }
                    }
                    if (!skipFile && fileCount < 100) {
                        if (sourceFile.endsWith (".mp4") || sourceFile.endsWith(".avi") || sourceFile.endsWith(".webm") || sourceFile.endsWith(".mpg") || sourceFile.endsWith(".m4v")) {
                            fileCount++;
                            getMovie(sourceFile, pathType, local);
                        }
                    }
                }
            }
        }
    }
    res.end("DONE");
};

var getMovie = function(sourceFile, pathType, local) {
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
        file: sourceFile,
        host: "api.themoviedb.org",
        path: "/3/search/movie?api_key=" + local.video.settings.tmdbApiKey + "&query=" + escape(searchTitle) + "&year=" + searchYear,
        port: 443,
        method: "GET",
        headers: {"content-type": "application/json", "accept": "application/json" }
    };
    https.get(options, function(response) {
        var mData = "";
        response.on("error", function (err) { console.log("TMDb Search Error: " + err.message); });
        response.on("data", function (d) { try { mData += d.toString();} catch (e) { } });
        response.on("end", function () {
            if (mData == "") {
                console.log("Bad Data.");
            } else {
                var searchResult = JSON.parse(mData);
                if (searchResult["total_results"] <= 0) {
                    console.log("TheMovieDb.org search for " + options.path + " found 0 matches.");
                } else {
                    if (searchResult["total_results"] > 0) {
                        console.log("TheMovieDb.org search for " + options.file + " found " + searchResult["total_results"] + " matches.");
                    }
                    var matchResult = null;
                    try { matchResult = searchResult["results"][0]; } catch (e) { matchResult = null; }
                    if (matchResult == null) {
                        console.log("FAIL Get results for " + options.file);
                    } else {
                        console.log("GET Movie Id " + matchResult.id + " " + matchResult.title);
                        var options2 = {
                            host: "api.themoviedb.org",
                            path: "/3/movie/" + matchResult.id + "?api_key=" + local.video.settings.tmdbApiKey,
                            port: 443,
                            method: "GET",
                            headers: {"content-type": "application/json", "accept": "application/json"}
                        };
                        https.get(options2, function(response2) {
                            var mData2 = "";
                            response2.on("error", function (err) { processResponse.write("TMDb Movie Error: " + err.message + "<br/>\n"); });
                            response2.on("data", function (d2) { try { mData2 += d2.toString();} catch (e) { } });
                            response2.on("end", function () {
                                var match = JSON.parse(mData2);
                                var movie = JSON.parse(JSON.stringify(local.video.settings.template));
                                movie.RowKey = uuid();
                                movie.TMDb = match.id;
                                movie.filePath = "/" + pathType + "/" + options.file;
                                movie.file = options.file;
                                movie.update = false;
                                movie.own = false;
                                movie.MyDb = "0";
                                movie.adult = "adult" in match ? match.adult : "";
                                movie.backdrop = "backdrop_path" in match ? match.backdrop_path : "";
                                movie.collection = match.belongs_to_collection == null ? {} : match.belongs_to_collection;
                                movie.name = "title" in match ? match.title.replace("'",escape("'")) : "";
                                movie.nameSort = "title" in match ? match.title.replace("'","") : "";
                                movie.popularity = "vote_average" in match ? match.vote_average : "";
                                movie.released = "release_date" in match ? match.release_date : "";
                                movie.poster= "poster_path" in match ? match.poster_path : "";
                                movie.IMDb = "imdb_id" in match ? match.imdb_id : "";
                                movie.type = pathType;
                                movie.overview = "overview" in match ? match.overview != null ? match.overview.replace("'",escape("'")).replace("\"",escape("\"")) : "N/A" : "N/A";
                                movie.rating = "rating" in match ? match.rating : "";
                                movie.certification = "certification" in match ? match.certification : "";
                                movie.url = "url" in match ? match.url : "";
                                movie.runtime = "runtime" in match ? match.runtime : "0";
                                movie.tagline = "tagline" in match ? match.tagline != null ? match.tagline.replace("'",escape("'")).replace("\"",escape("\"")) : "" : "";
                                movie.homepage = "homepage" in match ? match.homepage : "";
                                movie.categories = {};
                                movie.keywords = {};
                                movie.cast = {};
                                movie.backdrops= {};
                                movieFiles.push(movie)
                                fs.writeFile("movies.json", JSON.stringify(movieFiles, null, 2), function (err) { console.log(err); });
                            });
                        });
                    }
                }
            }
        });
    });
};

function sortByName(x,y) {
    return ((x.nameSort == y.nameSort) ? 0 : ((x.nameSort > y.nameSort) ? 1 : -1 ));
};

