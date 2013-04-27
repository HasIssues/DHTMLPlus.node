exports.config = {
	"BUILDINTHECLOUD": {
		domian: "preview.hasissues.com",
		deployment: {
			revision: "HEAD",
			deployon: "02/06/2010 18:00"
		},
		settings: {
			endpoint: ["https://www.hasissues.com:80"],
			redirect: ["http://hasissues.com:80"]
		},
		config: [
			{ key: "templateType", value: "dir" },
			{ key: "templatesPath", value: "sites" },
		]
	},
	"AZURE":
	{
	}
};
