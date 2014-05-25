exports.config = {
	"LOCAL": {
        templates: {path: "E:/WebSites/"},
		endpoint: {
			"360report.com": { subDomain: "preview", port: 80, auth: "none" },
			"bestnetchoice.com": { subDomain: "preview", port: 80, auth: "none" },
			"bowzntoez.com": { subDomain: "preview", port: 80, auth: "none" },
			"buildinthecloud.com": { subDomain: "preview", port: 80, auth: "none" },
			"buttonznjoolz.com": { subDomain: "preview", port: 80, auth: "none" },
			"chiefinternetofficers.com": { subDomain: "preview", port: 80, auth: "none" },
			"dhtmlplus.com": { subDomain: "preview", port: 80, auth: "none" },
			"hasissues.com": { subDomain: "preview", port: 80, auth: "none" },
			"helpersite.com": { subDomain: "preview", port: 80, auth: "none" },
			"keepersite.com": { subDomain: "preview", port: 80, auth: "none" },
			"meshdaddy.com": { subDomain: "preview", port: 80, auth: "none" },
			"mevirtually.com": { subDomain: "preview", port: 80, auth: "none" },
			"multiverseonline.com": { subDomain: "preview", port: 80, auth: "none" },
			"mycoachportal.com": { subDomain: "preview", port: 80, auth: "none" },
			"myleaderportal.com": { subDomain: "preview", port: 80, auth: "none" },
			"ta5k.com": { subDomain: "preview", port: 80, auth: "none" },
			"webtavern.net": { subDomain: "preview", port: 80, auth: "none" },
			"is-a-geek.org": { subDomain: "mark", port: 80, auth: "none" },
			"hobby-site.com": { subDomain: "console", port: 80, auth: "none" },
			"sneakerz.com": { subDomain: "www", port: 80, auth: "basic" }
		},
		redirect: {
			"sneakerz.com": { subDomain: "", subDomainPort: 80, directTo: "www", directToPort: 80 }
		}
	},
	"AZURE": {
        templates: {path: "/"},
		endpoint: {
			"azurewebsites.net": { subDomain: "hasissues", port: 80, auth: "none" },
			"360report.com": { subDomain: "www", port: 80, auth: "none" },
			"bestnetchoice.com": { subDomain: "www", port: 80, auth: "none" },
			"bowzntoez.com": { subDomain: "www", port: 80, auth: "none" },
			"buildinthecloud.com": { subDomain: "www", port: 80, auth: "none" },
			"buttonznjoolz.com": { subDomain: "www", port: 80, auth: "none" },
			"chiefinternetofficers.com": { subDomain: "www", port: 80, auth: "none" },
			"dhtmlplus.com": { subDomain: "www", port: 80, auth: "none" },
			"hasissues.com": { subDomain: "www", port: 80, auth: "none" },
			"helpersite.com": { subDomain: "www", port: 80, auth: "none" },
			"keepersite.com": { subDomain: "www", port: 80, auth: "none" },
			"meshdaddy.com": { subDomain: "www", port: 80, auth: "none" },
			"mevirtually.com": { subDomain: "www", port: 80, auth: "none" },
			"multiverseonline.com": { subDomain: "www", port: 80, auth: "none" },
			"mycoachportal.com": { subDomain: "www", port: 80, auth: "none" },
			"myleaderportal.com": { subDomain: "www", port: 80, auth: "none" },
			"ta5k.com": { subDomain: "www", port: 80, auth: "none" },
			"webtavern.net": { subDomain: "www", port: 80, auth: "none" }
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
