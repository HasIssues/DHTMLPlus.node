/*
Local settings to mirror azure
Exclude this from git
*/
exports.localKeys = {
	"AZURE_STORAGE_ACCOUNT": "hasissues",
	"AZURE_STORAGE_ACCESS_KEY":"EJPSiAd5NvbcTDAVr4qiHfIZQH7NiBPcPFgtD4Z8u+AD1FTl2zeVhuk39Ve761aHzAxtbDVGwWP7BVJby602zA==",
	"port": 80,
	"useCloudData": false,
    "useCluster": true,
    "useHttpSys": false

};
/*
settings for video streaming
*/
exports.video = {
	settings: {
		"AZURE_STORAGE_ACCOUNT": "sneakerz",
		"AZURE_STORAGE_ACCESS_KEY":"xYJ+XEWJcEgBbHb7/FKpt+sswIaahly7Ix4rOl+RHy57axiyUoltEh/gqzIOL92htOMajcL1IDLJtHpmftJKFA==",
		tmdbApiKey: "37b3a21aa5c5ebd0518d9f4213038edc",
		domains: ["sneakerz.com"],
		users: {
			"all": "idontknow"
		},
		template : {
			PartitionKey : "movie",
			RowKey: 0,
			update: false,
			own: false,
			MyDb: "0",
			TMDb: 0,
			IMDb: "",
			popularity: 0,
			adult: false,
			name: "",
			nameSort: "",
			type: "",
			overview: "",
			rating: "",
			certification: "",
			url: "",
			released: "",
			runtime: "",
			homepage: "",
			poster: "/images/no-poster.jpg",
			backdrop: "",
			tagline: "",
			collection: {},
			categories: {},
			keywords: {},
			cast: {},
			backdrops: {},
			filePath: "",
			virtualPath: "",
			file: ""
		}
	},
	transcode: {
		"mp4": "mp4",
		"avi": "webm",
		"mkv": "webm",
		"mkv": "webm",
		"m4v": "webm"
	},
	paths: {
		"movies": "M:/Movies",
		"movies-cam": "M:/Movies-CAM",
		"movies-3d": "M:/Movies-3D"
	},
	pathTypes: {
		"movies": "movie",
		"movies-cam": "movie-cam",
		"movies-3d": "movie-3D"
	}
};
