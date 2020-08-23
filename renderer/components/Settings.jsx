import electron from "electron";

import React from "react";

import { Switch, Collapse, Row, Col } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const ipcRenderer = electron.ipcRenderer || false;
class Settings extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			version: "",
		};
	}

	componentDidMount() {
		if (ipcRenderer) {
			ipcRenderer.send("app_version");
			ipcRenderer.on("app_version", (event, arg) => {
				ipcRenderer.removeAllListeners("app_version");
				this.setState({
					version: arg.version,
				});
			});
		}
	}


	render(){

		return(
			<>
				<Collapse accordion bordered={false}>
					<Panel header="General Settings" key="1">
						<Row>
							<Col span={18}>
								Debug Mode:
							</Col>
							<Col span={6}>
								<Switch
									checked={this.props.logging}
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									onChange={this.props.changeLogging}
								/>
							</Col>
						</Row>
						
					</Panel>
					<Panel header="Crawler Settings" key="2">
						<p>
							No Settings Yet
						</p>
					</Panel>
					<Panel header="Search Settings" key="3">
						<p>
							No Settings Yet
						</p>
					</Panel>
				</Collapse>
				<pre style={{"textAlign": "center"}}>Version: {this.state.version}</pre>
			</>
		);
	}
}

export default Settings;