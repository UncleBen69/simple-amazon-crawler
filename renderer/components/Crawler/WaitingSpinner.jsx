import electron from "electron";

import React from "react";
import {
	Typography,
	Spin,
	Space,
} from "antd";

const { Title } = Typography;

import Console from "../Console";

const ipcRenderer = electron.ipcRenderer || false;
class WaitingSpinner extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			foundURL: "",
			pages: [],
			pageNumber: 0
		};
	}

	componentDidMount() {
		if (ipcRenderer) {
			ipcRenderer.on("crawl::foundUrl", (event, arg) => {
				let data = JSON.parse(arg);

				if(data.id !== this.props.id) return;

				let oldPages = this.state.pages;

				let newArray = [
					{text: data.element},
					...oldPages
				];
				
				this.setState({
					pages: newArray,
					foundURL: data.element,
					pageNumber: this.state.pageNumber + 1,
				});

				this.props.newPageNumber(this.state.pageNumber + 1);
			});
		}
	}

	render(){
		return(
			<>
				<div className="container">
					<Space direction="vertical" align="center">

						<Spin size="large" />
							
						<Title level={3}>
								Please wait while the site gets crawled
						</Title>
							

						<Title level={4}>On Page {this.state.pageNumber} :</Title>

						<div className="TextContainer">
							<Console data={this.state.pages}/>
						</div>

						<style jsx>{`
							.TextContainer{
								height: 25vh;
								width: 100%;
								min-width: 25vw;
								background-color: #202124;
								box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
								overflow-y: hidden;
								text-align: center;
							}
						`}</style>
					</Space>
				</div>
			</>
		);
	}
}

export default WaitingSpinner;