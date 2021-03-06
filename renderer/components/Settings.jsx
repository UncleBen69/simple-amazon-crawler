import electron from "electron";
const os = require("os");

import Settings from "../../main/settings";

import React from "react";

import { Switch, Collapse, Row, Col, Input, Button, Space, Tooltip, InputNumber, Modal, notification } from "antd";
import { CloseOutlined, CheckOutlined, ReloadOutlined, ExclamationCircleOutlined, DashboardOutlined, CloudSyncOutlined, LoadingOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { confirm } = Modal;
const { TextArea } = Input;


const ipcRenderer = electron.ipcRenderer || false;
class SettingsPage extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			version: "-.-.-",
			settings: Settings.store,
		};
	}

	componentDidMount() {
		if (ipcRenderer) {
			this.setState({
				version: ipcRenderer.sendSync("app::version"),
			});
		}
	}

	changeSetting = (category, setting, event, value) =>{
		console.log(category, setting, event, value);

		let NewValue;

		// Mass Change
		if(event !== undefined){
			// If input event
			console.log("Event: ", event.target.value);
			NewValue = event.target.value;
		} else if(value !== undefined) {
			if(value == null) value = 0;
			console.log("Force Value: ", value);
			NewValue = value;
		}else{
			console.log("No value provided, toggle");
			NewValue = !this.state.settings[category][setting];
		}

		//console.log(NewSettings);
	
		Settings.set(`${category}.${setting}`, NewValue);

		let NewSettings = this.state.settings;
		
		NewSettings[category][setting] = NewValue;


		this.setState({
			settings: {...NewSettings}
		});
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

				ipcRenderer.send("settings::revert");
			},
			onCancel() {
				console.log("Cancel");
			},
		});
	};



	render(){
		const { settings } = this.state;
		console.log("Store: ", Settings.store);
		
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

							<Col flex={2}>
								Table Rows Per Page:
							</Col>
							<Col flex={"auto"} className="holdright">
								<Tooltip title="Setting this to 0 will disable pagination" placement="topRight">
									<InputNumber
										disabled={!settings}
										min={0}
										value={settings !== null ? settings.generalSettings.rowsPerPage : null}
										onChange={(number)=> this.changeSetting("generalSettings", "rowsPerPage", undefined, number)}
									/>
								</Tooltip>
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

							<Tooltip title="Check if there's newer versions available">
								<Button 
									loading={!settings}
									type="primary" 
									block
									icon={<CloudSyncOutlined />} 
									onClick={() => {
										notification.info({
											message: "Checking for updates",
											icon: <LoadingOutlined />,
											placement: "topLeft"
										});

										ipcRenderer.send("update::check");
									}}
								>
									Check For Updates
								</Button>
							</Tooltip>

							<Tooltip title="Reset all settings to defaults" placement="bottom">
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
								<Space>
									<InputNumber
										disabled={!settings}
										min={1}
										value={settings !== null ? settings.expandSettings.parallel : null}
										onChange={(number)=> this.changeSetting("expandSettings", "parallel", undefined, number)}
									/>

									<Tooltip title="Set to best amount for hardware (still testing)" placement="topRight">
										<Button 
											loading={!settings}
											type="primary" 
											icon={<DashboardOutlined />} 
											onClick={() => {
												// Get threads
												const cpuCount = os.cpus().length;

												this.changeSetting(
													"expandSettings", 
													"parallel", 
													undefined, 
													cpuCount - 1
												);
												
											}}
										/>
									</Tooltip>
								</Space>
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


String.prototype.interpolate = function(params) {
	const names = Object.keys(params);
	const vals = Object.values(params);
	return new Function(...names, `return \`${this}\`;`)(...vals);
};

export default SettingsPage;