DHTMLPlus
=========

DHTMLPlus is an HTML Template Framework built for nodeJS, It has support for Azure. It is designed to help Web Developers build websites quickly and intergrate nodeJS at thier own pace.

DHTMLPlus uses HTML pages as templates and JSON files for content. Cheerio is used to merge in data and content serverside. Templates and content are 
stored seperate from the base code in Azure Blob Storage or local dir. This allows one code base to support unlimited sites.


Guides / How-to's
-----------------
[DHTMLPlus.node wiki](https://github.com/HasIssues/DHTMLPlus/wiki/home) Guides and detailed help topics.

installation
------------
npm install dhtmlplus

[Real World Example](https://github.com/HasIssues/DHTMLPlus.node) This is my Git Project I use with Azure to support 20 sites. Uses both local and Azure.


Development Setup 
-----------------
In your code folder, create a file called local.js
```Javascript
exports.devKeys = {
	"AZURE_STORAGE_ACCOUNT": "name here",
	"AZURE_STORAGE_ACCESS_KEY":"key value here",
	"port": 80,
	"useCloudData": false,
	"useCluster": true
};
/* settings for video streaming */
exports.video = {
	settings: {
		"AZURE_STORAGE_ACCOUNT": "name here",
		"AZURE_STORAGE_ACCESS_KEY":"key value here",
		tmdbApiKey: "key value here",
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
		"movies-3d": "M:/Movies-3D"
	},
	pathTypes: {
		"movies": "movie",
		"movies-3d": "movie-3D"
	}
};

```
In your code folder, modify config.js for your environments
```Javascript
exports.config = {
	"LOCAL": {
		endpoint: {
			"azurewebsites.net": { subDomain: "hasissues", port: 80 },
			"hasissues.com": { subDomain: "preview", port: 80 },
			"sneakerz.com": { subDomain: "www", port: 80 }
		},
		redirect: {
			"sneakerz.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 }
		}
	},
	"AZURE": {
		endpoint: {
			"azurewebsites.net": { subDomain: "hasissues", port: 80 },
			"hasissues.com": { subDomain: "www", port: 80 }
		},
		redirect: {
			"hasissues.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 }
		}
	}
};
```

```shell

```

Development
-----------
* create a DNS/Host entry for `preview.your-site.com` that points to your development machine.


Template Setup 
--------------
* Create a `templates` folder in you code folder and Exclude from git
* Create a sub folder for each website. Example: `hasissues-com`.
* the default page should be `home.htm`

```html
<html>
<head fullPage="true" masterPage="MasterPage" codebehind="true">
</head>
<body>
	<h1 id="content_01" contentEditable="true">New H1 Title Text</h1>
	<p id="content_08" contentEditable="true">New Paragraph Text</p>
	<h2 id="content_News_title" contentEditable="true">Title</h2>
	<ul id="content_News" contentEditable="true"><li>Current</li></ul>
	<div style="clear:both;"></div>
</body>
</html>
```

Server Side Code Behind
-----------------------
Code Behind lets you create server side script to execute on your templates.
In the site template folder, create a js file with the same name as your template file. Example `home.js` for the code behind for `home.htm`
```Javascript
var codebehind = function($, path, response) {
	$("span.issues").html("ISSUES");
};
```

Publishing Site Templates
-------------------------
Publish only works from your LOCAL node server.
* Create a Azure Blob Storage folder with the name of your site. Example: `hasissues-com`.
* Browse to preview.your-site.com/publish.htm, this will publish your site to your blob storage account.
