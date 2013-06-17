DHTMLPlus.node
==============

DHTMLPlus for Azure

DHTMLPlus is a Websites HTML Template system built in nodeJS for Azure.

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
Create a file called dev.js
```html
exports.devKeys = {
	"AZURE_STORAGE_ACCOUNT": "name here",
	"AZURE_STORAGE_ACCESS_KEY":"key value here"
};
```
```shell

```

Development
-----------
* create a DNS/Host entry for preview.your-site.com that points to your development machine.


Template Setup 
--------------
* Create a `templates` folder in you code folder and Exclude from git
* Create a sub folder for each website. Example: `hasissues-com`.
* the default page should be home.htm

Publishing Site Templates
-------------------------
Publish only works from your LOCAL node server.
* Create a Azure Blob Storage folder with the name of your site. Example: `hasissues-com`.
* Browse to preview.your-site.com/publish.htm, this will publish your site to your blob storage account.
