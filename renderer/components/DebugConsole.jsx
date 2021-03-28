import electron from "electron";

import React from "react";

import Settings from "../../main/settings";

import Console from "./Console";

const ipcRenderer = electron.ipcRenderer || false;
class DebugConsole extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			enabled: null,
			logs: []
		};
	}

	componentDidMount() {
		this.setState({enabled: Settings.get("generalSettings.debug")});
		
		// Listen for updates to debug setting
		Settings.onDidChange("generalSettings.debug", (newVal) => {
			//console.log("Changed To", newVal);
			this.setState({enabled: newVal});
		});

		if (ipcRenderer) {
			ipcRenderer.on("debug::log", (event, arg) => {
				let data = JSON.parse(arg);

				//console.log(data);
				
				const {text, from} = data;

				let oldLog = this.state.logs;

				let newArray = [
					{text,from},
					...oldLog
				];
				//console.log(newArray);
				
				this.setState({
					logs: newArray,
				});
			});
		}
	}


	render(){
		const {logs} = this.state;
		//console.log("Console ", this.state.enabled);
		return(
			<>
				<div className="bottomRightDebug" style={{ "display": this.state.enabled ? "block" : "none"}}>
					<Console data={logs} />
				</div>

				<style jsx>{`
					.bottomRightDebug{
						position:fixed;
						bottom: 0;
						right: 0;
						height: 25vh;
						width: 100%;
						background-color: #202124;
						box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
						overflow-y: scroll;
					}
				`}</style>
			</>
		);
	}
}

export default DebugConsole;