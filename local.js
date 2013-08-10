/*
Local settings to mirror azure
Exclude this from git
*/
exports.localKeys = {
	"AZURE_STORAGE_ACCOUNT": "hasissues",
	"AZURE_STORAGE_ACCESS_KEY":"EJPSiAd5NvbcTDAVr4qiHfIZQH7NiBPcPFgtD4Z8u+AD1FTl2zeVhuk39Ve761aHzAxtbDVGwWP7BVJby602zA==",
	"port": 80,
	"useCloudData": false,
	"useCluster": true
};
/*
settings for video streaming
*/
exports.video = {
	settings: {

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
		"movies-own": "M:/Movies-OWN",
		"movies-cam": "M:/Movies-CAM",
		"movies-3d": "M:/Movies-3D"
	}
};
