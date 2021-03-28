import * as Store from "electron-store";

export default new Store({
	name: "settings-store",
	clearInvalidConfig: true,
	accessPropertiesByDotNotation: true,
	watch: true,

	defaults: {
		generalSettings: {
			debug: false,
			openDevTools: false,
			installReactDevTools: false,
			rowsPerPage: 100 
		},
		crawlerSettings: {
			stripQuerystring: true,
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
			respectRobotsTxt: false,
			maxConcurrency: 10,
			scanSubdomains: false,
			interval: 50,
			downloadUnsupported: false 
		},
		expandSettings: {
			parallel: 10
		}
	}
});