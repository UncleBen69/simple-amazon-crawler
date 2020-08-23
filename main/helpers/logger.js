
export default function send(window, message, from) {
	console.log(message);
	
	window.webContents.send("debug::log", JSON.stringify({text: message, from}));
}