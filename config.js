/*
 * This file should be modified to mirror you site setup.
 * Your websites should be in ../WebSites/
 * 
*/

exports.config = {
	"PREVIEW": {
        templates: {path: "../WebSites/"},
		endpoint: {
			"bowzntoez.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"buildinthecloud.com": { subDomain: "preview", port: 80, auth: "none", type: "angularJS", default: "index.html" },
			"buttonznjoolz.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"dhtmlplus.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"hasissues.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"hebert.ninja": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"meshdaddy.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"mevirtually.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"myiot.ninja": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"sneakerz.com": { subDomain: "preview", port: 80, auth: "basic", type: "static", default: "index.html" },
			"ta5k.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"webtavern.net": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"is-a-geek.org": { subDomain: "mark", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"hobby-site.com": { subDomain: "console", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" }
		},
		redirect: {
			"sneakerz.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 }
		}
	},
	"LOCAL": {
        templates: {path: "../WebSites/"},
		endpoint: {
			"bowzntoez.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"buttonznjoolz.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"dhtmlplus.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"hebert.ninja": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"sneakerz.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" }
		},
		redirect: {
			"bowzntoez.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"buttonznjoolz.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"hebert.ninja": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"sneakerz.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 }
		}
	},
	"AZURE": {
        templates: {path: "/"},
		endpoint: {
			"azurewebsites.net": { subDomain: "hasissues", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"buildinthecloud.com": { subDomain: "www", port: 80, auth: "none", type: "angularJS", default: "index.html" },
			"dhtmlplus.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"hasissues.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"meshdaddy.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"mevirtually.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"myiot.ninja": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"ta5k.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"webtavern.net": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" }
		},
		redirect: {
			"buildinthecloud.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"dhtmlplus.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"hasissues.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"meshdaddy.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"mevirtually.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"myiot.ninja": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"ta5k.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"webtavern.net": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 }
		}
	}
};
