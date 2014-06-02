exports.config = {
	"LOCAL": {
        templates: {path: "E:/WebSites/"},
		endpoint: {
			"360report.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"bestnetchoice.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"bowzntoez.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"buildinthecloud.com": { subDomain: "preview", port: 80, auth: "none", type: "angularJS", default: "index.html" },
			"buttonznjoolz.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"chiefinternetofficers.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"dhtmlplus.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"hasissues.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"helpersite.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"keepersite.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"meshdaddy.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"mevirtually.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"multiverseonline.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"mycoachportal.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"myleaderportal.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"ta5k.com": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"webtavern.net": { subDomain: "preview", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"is-a-geek.org": { subDomain: "mark", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"hobby-site.com": { subDomain: "console", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"sneakerz.com": { subDomain: "www", port: 80, auth: "basic", type: "static", default: "index.html" }
		},
		redirect: {
			"sneakerz.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 }
		}
	},
	"AZURE": {
        templates: {path: "/"},
		endpoint: {
			"azurewebsites.net": { subDomain: "hasissues", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"360report.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"bestnetchoice.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"bowzntoez.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"buildinthecloud.com": { subDomain: "www", port: 80, auth: "none", type: "angularJS", default: "index.html" },
			"buttonznjoolz.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"chiefinternetofficers.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"dhtmlplus.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"hasissues.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"helpersite.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"keepersite.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"meshdaddy.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"mevirtually.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"multiverseonline.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"mycoachportal.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"myleaderportal.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"ta5k.com": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" },
			"webtavern.net": { subDomain: "www", port: 80, auth: "none", type: "DHTMLPlus", default: "home.htm" }
		},
		redirect: {
			"360report.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"bestnetchoice.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"bowzntoez.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"buildinthecloud.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"buttonznjoolz.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"chiefinternetofficers.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"dhtmlplus.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"hasissues.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"helpersite.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"keepersite.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"meshdaddy.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"mevirtually.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"multiverseonline.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"mycoachportal.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"myleaderportal.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"ta5k.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 },
			"webtavern.net": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 }
		}
	}
};
