DHTMLPlus.node
==============

DHTMLPlus for Azure

DHTMLPlus is a HTML Template Framework built in nodeJS for Azure. It is designed to help Web Developers build websites quickly and intergrate nodeJS at thier own pace.

DHTMLPlus uses HTML pages as templates and JSON files for content. Cheerio is used to merge in data and content serverside. Templates and content are 
stored seperate from the base code in Azure Blob Storage. This allows one code base to support unlimited sites.

node.js Packages
----------------
`azure`
`cheerio`
`connect`
`express`

Development Setup 
-----------------
In your code folder, create a file called dev.js
```html
exports.devKeys = {
	"AZURE_STORAGE_ACCOUNT": "name here",
	"AZURE_STORAGE_ACCESS_KEY":"key value here"
};
```
In your code folder, modify config.js for your environments
```html
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
```html
var codebehind = function($, path, response) {
	$("span.issues").html("ISSUES");
};
```

Publishing Site Templates
-------------------------
Publish only works from your LOCAL node server.
* Create a Azure Blob Storage folder with the name of your site. Example: `hasissues-com`.
* Browse to preview.your-site.com/publish.htm, this will publish your site to your blob storage account.
