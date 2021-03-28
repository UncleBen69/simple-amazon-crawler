import { app, ipcMain } from "electron";
import serve from "electron-serve";
const { autoUpdater } = require("electron-updater");

import { createWindow, startCrawl, expand, logger } from "./helpers";

import Settings from "./settings";


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
	
	if (isProd) {
		await mainWindow.loadURL("app://./home.html");
	} else {		
		const port = process.argv[2];
		await mainWindow.loadURL(`http://localhost:${port}/home`);
	}
	// Conditional

	console.log(Settings.store);

	if(!isProd || Settings.get("generalSettings.installReactDevTools")){
		console.log("INSTALL REACT DEV TOOLS");
		const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");

		installExtension(REACT_DEVELOPER_TOOLS)
			.then((name) => logger(mainWindow, `Added Extension: ${name}`, "general"))
			.catch((err) => logger(mainWindow, `Error Occured adding extension: ${err.message}`, "general"));
	}

	if(!isProd || Settings.get("generalSettings.openDevTools")){
		console.log("Open Dev Tools");
		mainWindow.webContents.openDevTools();
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
ipcMain.on("settings::revert", () => {
	logger(mainWindow, "Reverting Settings & Relaunching", "setting");

	Settings.clear();

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
ipcMain.on("update::restart", () => {
	autoUpdater.quitAndInstall();
});

ipcMain.on("update::check", () => {
	autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-available", () => {
	mainWindow.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
	mainWindow.webContents.send("update_downloaded");
});