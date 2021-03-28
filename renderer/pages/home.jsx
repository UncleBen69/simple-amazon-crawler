import electron from "electron";

import React from "react";
import Head from "next/head";

import "antd/dist/antd.css";

// eslint-disable-next-line no-unused-vars
import { SettingFilled, ExclamationCircleOutlined } from "@ant-design/icons";
import { Tabs, Button, Popover, notification, Modal } from "antd";
const { TabPane } = Tabs;
const { confirm } = Modal;


import NewPage from "../components/newPage";
import Settings from "../components/Settings";
import DebugConsole from "../components/DebugConsole";


const ipcRenderer = electron.ipcRenderer || false;
class Home extends React.Component {
	constructor(props){
		super(props);

		this.newTabIndex = 0;

		this.state = {
			logging: null,
			activeKey: 1,
			panes: [
				{
					title: "New Page",
					content: <NewPage titleChange={this.titleChange} id="1" />,
					key: "1",
				}
			],
		};
	}
	
	componentDidMount() {
		if (ipcRenderer) {
			
			// Debug Settings
			const settings = JSON.parse(ipcRenderer.sendSync("settings::get"));
			this.setState({
				logging: settings.generalSettings.debug,
			});

			ipcRenderer.on("update_available", () => {
				ipcRenderer.removeAllListeners("update_available");
				//message.innerText = "A new update is available. Downloading now...";

				notification.open({
					message: "A new update is available. Downloading now...",
					icon: <ExclamationCircleOutlined  style={{ color: "#108ee9" }} />,
				});
			});

			ipcRenderer.on("update_downloaded", () => {
				ipcRenderer.removeAllListeners("update_downloaded");
				//message.innerText = "Update Downloaded. It will be installed on restart. Restart now?";
				
				// Notification
				confirm({
					title: "Update Downloaded. It will be installed on restart.",
					icon: <ExclamationCircleOutlined />,
					content: "Do you want to restart now?",
					onOk() {
						console.log("OK");
						ipcRenderer.send("restart_app");
					},
					onCancel() {
						console.log("Cancel");
					},
				});

			});
		}
	}

	restartApp = () => {
		ipcRenderer.send("restart_app");
	}

	changeLogging = () => {
		this.setState(prevState => ({
			logging: !prevState.logging
		}));
	}

	onChange = activeKey => {
		this.setState({ activeKey });
	};
  
	onEdit = (targetKey, action) => {
		this[action](targetKey);
	};
  
	add = () => {
		const { panes } = this.state;

		const activeKey = `newTab${this.newTabIndex++}`;

		panes.push({ title: "New Page", content: <NewPage titleChange={this.titleChange} id={activeKey} />, key: activeKey });

		this.setState({ panes, activeKey });
	};

	titleChange = (title, id) => {
		console.log("Change Title to ", title, id);

		for (let i = 0; i < this.state.panes.length; i++) {
			const element = this.state.panes[i];

			if (element.key == id){
				let newPanes = this.state.panes;

				newPanes[i].title = title;

				this.setState({
					panes: newPanes
				});
			}
		}
	}
  
	remove = targetKey => {
		let { activeKey } = this.state;
		let lastIndex;
		this.state.panes.forEach((pane, i) => {
			if (pane.key === targetKey) {
				lastIndex = i - 1;
			}
		});

		// Stop Crawl if running
		ipcRenderer.send("crawler::stop", JSON.stringify({id: targetKey}));

		const panes = this.state.panes.filter(pane => pane.key !== targetKey);
		if (panes.length && activeKey === targetKey) {
			if (lastIndex >= 0) {
				activeKey = panes[lastIndex].key;
			} else {
				activeKey = panes[0].key;
			}
		}
		this.setState({ panes, activeKey });
	};
  
	render() {
		const { panes, activeKey } = this.state;

		return (
			<>
				<Head>
					<title>Simple Amazon Crawler Tool</title>
				</Head>
				<Tabs
					type="editable-card"
					onChange={this.onChange}
					activeKey={String(activeKey)}
					
					onEdit={this.onEdit}
					tabBarExtraContent={
						<Popover 
							content={
								<Settings 
									changeLogging={this.changeLogging} 
								/>
							} 
							title="Settings" 
							trigger="click" 
							placement="bottomRight"
						>
							<Button type="primary" shape="circle" icon={<SettingFilled />} />
						</Popover>
					}
				>
					{panes.map((pane) => (
						<TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
							{pane.content}
						</TabPane>
					))}
				</Tabs>
				
				
				<DebugConsole enabled={this.state.logging}/>
				

				<style global jsx>{`
					.ant-tabs-extra-content{
						margin-right: 5px;
					}
					.container {
						position: fixed;
						top: 50%;
						left: 50%;
						/* bring your own prefixes */
						transform: translate(-50%, -50%);
					}
					body{
						background-color: #252729;
					}
					.ant-typography{
						color: #f1f3f4!important; 
					}
					.ant-tabs-tab{
						background-color: #202124!important;
						border-bottom-color: #323639!important;
						border-bottom-width: 3px!important;
						border-top-color: #202124!important;
						border-left-color: #202124!important;
						border-right-color: #202124!important;
					}
					.ant-tabs-tab-active{
						background-color: #323639!important;
						border-bottom-color: #40a9ff!important;
						border-bottom-width: 3px!important;
						border-top-color: #202124!important;
						border-left-color: #202124!important;
						border-right-color: #202124!important;
					}
					.ant-tabs-nav{
						background-color: #202124;
					}
					.ant-tabs-nav::before{
						border-bottom-color: #323639!important;
						border-bottom-width: 3px!important;
						margin-top: 2px!important;
					}
					.ant-tabs-nav-add{
						background-color: #323639!important;
						border-bottom-color: #323639!important;
						border-top-color: #202124!important;
						border-left-color: #202124!important;
						border-right-color: #202124!important;
					}
					.ant-tabs-nav-wrap{
						min-height: 42px;
					}
					.ant-tabs-tab-btn{
						color: #f1f3f4!important;
					}
					.ant-tabs-nav-wrap .anticon > svg {
						fill: rgba(255, 255, 255, .7);
					}
					.ant-tabs-tabpane .anticon > svg {
						fill: rgba(255, 255, 255, .7);
					}

					.ant-tabs-nav-wrap .anticon-close > svg:hover{
						fill: red;
					}
					.ant-tabs-nav-add > .anticon-plus > svg:hover{
						fill: green;
					}
					.ant-table-filter-trigger > .anticon-search > svg{
						fill: rgba(255, 255, 255, 0.65)!important;
					}
					.ant-popover-inner-content{
						padding: 0!important;
					}
				`}</style>
			</>
		);
	}
}

export default Home;