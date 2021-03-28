import electron from "electron";
import AwesomeDebouncePromise from "awesome-debounce-promise";

import React from "react";

import { Switch, Collapse, Row, Col, Input, Button, Space, Tooltip, InputNumber, Modal } from "antd";
import { CloseOutlined, CheckOutlined, ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { confirm } = Modal;

const ipcRenderer = electron.ipcRenderer || false;

// Debouncing
const UpdateFile = data => {
	//console.log(data);
	ipcRenderer.send("settings::update", JSON.stringify(data));
};

const updateDebounced = AwesomeDebouncePromise(UpdateFile, 250);


class Settings extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			version: "-.-.-",
			settings: null,
		};
	}

	componentDidMount() {
		if (ipcRenderer) {
			const settingsData = JSON.parse(ipcRenderer.sendSync("settings::get"));
			console.log("Got: ",settingsData);
			this.setState({
				settings: settingsData,
				version: ipcRenderer.sendSync("app::version"),
			});
			
		}
	}

	changeSetting = (category, setting, event, value) =>{
		console.log(category, setting, event, value);

		let NewSettings = this.state.settings;

		// If Debug option call props
		if(setting === "debug") this.props.changeLogging();

		// Mass Change
		if(Array.isArray(setting)){
			console.log("Mass change: ", setting);
			setting.forEach(e => {
				NewSettings[category][e.name] = e.value;
			});
		} else if(event !== undefined){
			// If input event
			console.log("Event: ", event.target.value);
			NewSettings[category][setting] = event.target.value;
		} else if(value !== undefined) {
			console.log("Force Value: ", value);
			NewSettings[category][setting] = value;
		}else{
			console.log("No value provided, toggle");
			NewSettings[category][setting] = !NewSettings[category][setting];
		}

		console.log(NewSettings);

		this.setState({
			settings: NewSettings, 
		});

		// Update File
		updateDebounced({...NewSettings});
	}	

	// Reset popover
	showPopconfirm = () => {
		confirm({
			title: "Are You Sure You Want To Reset?",
			icon: <ExclamationCircleOutlined style={{color: "#ff4d4f"}} />,
			content: "All custom settings will be reverted to default options & application will be relaunched",
			okType: "danger",
			okText: "Yes",
			onOk(){
				// Relaunch application
				let	NewSettings = require("../defaultSettings.json");

				ipcRenderer.send("settings::revert", JSON.stringify(NewSettings));
			},
			onCancel() {
				console.log("Cancel");
			},
		});
	};



	render(){
		const { settings } = this.state;
		//console.log(!settings);

		return(
			<>
				<Collapse accordion bordered={false}>
					<Panel header="General Settings" key="1">
						<Row align={"middle"} justify={"space-between"} gutter={[0, 8]}>
							<Col flex={2}>
								Debug Mode:
							</Col>
							<Col flex={"auto"} className="holdright">
								<Switch
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									
									loading={!settings}
									checked={settings !== null ? settings.generalSettings.debug : false}
									onChange={()=> this.changeSetting("generalSettings", "debug")}
								/>
							</Col>
							<p className="text-warning">These Settings Require A Restart To Fully Apply:</p>
							<Col flex={2}>
								Open Dev Tools At Launch:
							</Col>
							<Col flex={"auto"} className="holdright">
								<Switch
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									
									loading={!settings}
									checked={settings !== null ? settings.generalSettings.openDevTools : false}
									onChange={()=> this.changeSetting("generalSettings", "openDevTools")}
								/>
							</Col>

							<Col flex={2}>
								Install React Dev Tools:
							</Col>
							<Col flex={"auto"} className="holdright">
								<Switch
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									
									loading={!settings}
									checked={settings !== null ? settings.generalSettings.installReactDevTools : false}
									onChange={()=> this.changeSetting("generalSettings", "installReactDevTools")}
								/>
							</Col>


							<Tooltip title="Reset all settings to defaults">
								<Button 
									loading={!settings}
									type="primary" 
									danger
									block
									icon={<ReloadOutlined />} 
									onClick={() => this.showPopconfirm()}
								>
									Reset All
								</Button>
							</Tooltip>

						</Row>
						
					</Panel>
					<Panel header="Crawler Settings" key="2">
						<Row align={"middle"} justify={"space-between"} gutter={[0, 8]}>

							<Col flex={2}>
								User Agent:
							</Col>
							<Col flex={"auto"}>
								<Space>
									<Input
										disabled={!settings}
										value={settings !== null ? settings.crawlerSettings.userAgent : null}
										
										onChange={(e)=> this.changeSetting("crawlerSettings", "userAgent", e)}
									/>
									<Tooltip title="Reset to latest Chrome user agent" placement="topRight">
										<Button 
											loading={!settings}
											type="primary" 
											danger 
											icon={<ReloadOutlined />} 
											onClick={() => {
												this.changeSetting(
													"crawlerSettings", 
													"userAgent", 
													undefined, 
													"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
												);
											}}
										/>
									</Tooltip>
								</Space>
							</Col>

							<Col flex={2}>
								Strip Query String:
							</Col>
							<Col flex={"auto"} className="holdright">
								<Switch
									loading={!settings}
									checked={settings !== null ? settings.crawlerSettings.stripQuerystring : false}
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									onChange={()=> this.changeSetting("crawlerSettings", "stripQuerystring")}
								/>
							</Col>
						
							<Col flex={2}>
								Respect Robots.txt:
							</Col>
							<Col flex={"auto"} className="holdright">
								<Switch
									loading={!settings}
									checked={settings !== null ? settings.crawlerSettings.respectRobotsTxt : false}
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									onChange={()=> this.changeSetting("crawlerSettings", "respectRobotsTxt")}
								/>
							</Col>
											
							<Col flex={2}>
								Scan Subdomains:
							</Col>
							<Col flex={"auto"} className="holdright">
								<Switch
									loading={!settings}
									checked={settings !== null ? settings.crawlerSettings.scanSubdomains : false}
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									onChange={()=> this.changeSetting("crawlerSettings", "scanSubdomains")}
								/>
							</Col>
							
							<Col flex={2}>
								Crawl Images &amp; Media:
							</Col>
							<Col flex={"auto"} className="holdright">
								<Switch
									loading={!settings}
									checked={settings !== null ? settings.crawlerSettings.downloadUnsupported : false}
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									onChange={()=> this.changeSetting("crawlerSettings", "downloadUnsupported")}
								/>
							</Col>

							<Col flex={2}>
								Max Concurrency:
							</Col>
							<Col flex={"auto"} className="holdright">
								<InputNumber
									disabled={!settings}
									min={1}
									value={settings !== null ? settings.crawlerSettings.maxConcurrency : null}
									onChange={(number)=> this.changeSetting("crawlerSettings", "maxConcurrency", undefined, number)}
								/>
							</Col>

							<Col flex={2}>
								Wait Interval (ms):
							</Col>
							<Col flex={"auto"} className="holdright">
								<InputNumber
									disabled={!settings}
									min={0}
									value={settings !== null ? settings.crawlerSettings.interval : null}
									onChange={(number)=> this.changeSetting("crawlerSettings", "interval", undefined, number)}
								/>
							</Col>
						</Row>
					</Panel>
					<Panel header="Expander Settings" key="3">
						<Row align={"middle"} justify={"space-between"} gutter={[0, 8]}>

							<Col flex={2}>
								Parallel Workers:
							</Col>
							<Col flex={"auto"} className="holdright">
								<InputNumber
									disabled={!settings}
									min={1}
									value={settings !== null ? settings.expandSettings.parallel : null}
									onChange={(number)=> this.changeSetting("expandSettings", "parallel", undefined, number)}
								/>
							</Col>

						</Row>
					</Panel>
				</Collapse>
				<pre className="version">Version: {this.state.version}</pre>
				
				<style jsx>{`
					.text-warning{
						font-size: 10px;
						font-weight: 700;
						text-align: center;
						width: 100%;
						margin-top: 5px;
						margin-bottom: 5px;
					}
					.version{
						text-align: center;
					}
				`}</style>

				<style jsx global>{`
					.ant-input-number{
						width: 60px;
					}

					.ant-popover .ant-input-number-input{
						padding: 0 7px!important;
					}
					.ant-popover-content{
						width: 250px;
					}
					.ant-collapse-content-box{
						overflow: auto;
						max-height: 300px;
						padding: 4px 15px 16px 15px!important;
					}
					.holdright > :first-child{
						float: right;
					}
				`}</style>
			</>
		);
	}
}

export default Settings;