import { app, ipcMain } from "electron";
import serve from "electron-serve";
const { autoUpdater } = require("electron-updater");

const fs = require("fs");

import { createWindow, startCrawl, expand, logger } from "./helpers";


const isProd = process.env.NODE_ENV === "production";

if (isProd) {
	serve({ directory: "app" });
} else {
	app.setPath("userData", `${app.getPath("userData")} (development)`);
}


var mainWindow;

(async () => {
	await app.whenReady();

	mainWindow = createWindow("main", {
		backgroundColor: "#252729",
	});

	mainWindow.setMenu(null);

	await CheckSettingFile(()=>{
		var { generalSettings } = JSON.parse(fs.readFileSync(`${app.getPath("userData")}/settings.json`));

		if(!isProd || generalSettings.installReactDevTools){
			const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");

			installExtension(REACT_DEVELOPER_TOOLS)
				.then((name) => logger(mainWindow, `Added Extension: ${name}`, "general"))
				.catch((err) => logger(mainWindow, `Error Occured adding extension: ${err.message}`, "general"));
		}

		if(!isProd || generalSettings.openDevTools){
			mainWindow.webContents.openDevTools();
		}
	});

	if (isProd) {
		await mainWindow.loadURL("app://./home.html");
	} else {		
		const port = process.argv[2];
		await mainWindow.loadURL(`http://localhost:${port}/home`);
	}
})();

app.on("ready", function()  {
	autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
	app.quit();
});
// Listeners

// Settings
ipcMain.on("settings::get", (event) => {
	const settings = JSON.stringify(
		JSON.parse(fs.readFileSync(`${app.getPath("userData")}/settings.json`))
	);
	logger(mainWindow, `Requested settings, returned: ${settings}`, "setting");
	event.returnValue = settings;
});

ipcMain.on("settings::update", (event, arg) => {
	let data = JSON.parse(arg);
	console.log(data);
	logger(mainWindow, `Updating Settings To: ${JSON.stringify(data)}`, "setting");

	// Update file
	console.log(app.getPath("userData"));
	try {
		fs.writeFileSync(`${app.getPath("userData")}/settings.json`, JSON.stringify(data));
	} catch(err) {
		// An error occurred
		logger(mainWindow, `Setting Change Error: ${JSON.stringify(err.message)}`, "setting");
	}
});

ipcMain.on("settings::revert", (event, arg) => {
	let data = JSON.parse(arg);
	console.log(data);
	logger(mainWindow, `Reverting Settings To: ${JSON.stringify(data)} & Relaunching`, "setting");

	// Update file
	console.log(app.getPath("userData"));
	try {
		fs.writeFileSync(`${app.getPath("userData")}/settings.json`, JSON.stringify(data));
	} catch(err) {
		// An error occurred
		logger(mainWindow, `Setting Change Error: ${JSON.stringify(err.message)}`, "setting");
	}

	// Restart
	app.relaunch();
	app.quit();
});


ipcMain.on("crawl::submit", (event, arg) => {
	let data = JSON.parse(arg);

	logger(mainWindow, `Crawl requested on window ${data.id} for ${data.url} options: ${data.findURLS}`, "crawler");

	startCrawl(event, data.url, data.findURLS, data.id, mainWindow);
});

ipcMain.on("expand::submit", (event, arg) => {
	let data = JSON.parse(arg);

	logger(mainWindow, `Expand requested on window ${data.id} for ${data.urls.length}`, "expander");

	expand(event, data.urls, data.id, mainWindow);
});


ipcMain.on("app::version", (event) => {
	event.returnValue = app.getVersion();
});

// Autoupdater

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});

autoUpdater.on("update-available", () => {
	mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
	mainWindow.webContents.send("update_downloaded");
});




// TODO: Create default settings file if doesn't exist
function CheckSettingFile(Callback){
	let CreateSettingFile;
	logger(mainWindow, "Checking Setting File", "settings");

	new Promise(function(resolve){
		try {
			if (fs.existsSync(`${app.getPath("userData")}/settings.json`)) {
				//file exists
				logger(mainWindow, "Settings File Exists", "settings");

				var settings = JSON.parse(fs.readFileSync(`${app.getPath("userData")}/settings.json`));

				try {
				// Check type of all
					if(typeof settings.generalSettings.debug !== "boolean") CreateSettingFile = true;
					if(typeof settings.generalSettings.openDevTools !== "boolean") CreateSettingFile = true;
					if(typeof settings.generalSettings.installReactDevTools !== "boolean") CreateSettingFile = true;

					if(typeof settings.crawlerSettings.stripQuerystring !== "boolean") CreateSettingFile = true;
					if(typeof settings.crawlerSettings.userAgent !== "string") CreateSettingFile = true;
					if(typeof settings.crawlerSettings.respectRobotsTxt !== "boolean") CreateSettingFile = true;
					if(typeof settings.crawlerSettings.maxConcurrency !== "number") CreateSettingFile = true;
					if(typeof settings.crawlerSettings.scanSubdomains !== "boolean") CreateSettingFile = true;
					if(typeof settings.crawlerSettings.interval !== "number") CreateSettingFile = true;
					if(typeof settings.crawlerSettings.downloadUnsupported !== "boolean") CreateSettingFile = true;

					if(typeof settings.expandSettings.parallel !== "number") CreateSettingFile = true;
				
				} catch(err){
					logger(mainWindow, `Settings File Errored Must Mean Value Missing, ${JSON.stringify(err.message)}`, "settings");
					CreateSettingFile = true;
				}

			} else{
				logger(mainWindow, "Settings File Does Not Exist", "settings");
				CreateSettingFile = true;
			}
		} catch(err) {
			logger(mainWindow, `Settings File Check Errored, ${JSON.stringify(err.message)}`, "settings");
			CreateSettingFile = true;
		}
		console.log("Creating");
		if(CreateSettingFile === true){
			try {
				fs.writeFileSync(`${app.getPath("userData")}/settings.json`, JSON.stringify(JSON.parse(fs.readFileSync("./renderer/defaultSettings.json"))));
				logger(mainWindow, "New Settings File Created", "settings");
				

			} catch(err) {
				// An error occurred
				logger(mainWindow, `Setting Change Error: ${JSON.stringify(err.message)}`, "setting");
				
			}
		} else{
			logger(mainWindow, "No Problems With Settings File Found", "settings");
			
		}

		Callback();
		resolve();
	});
}