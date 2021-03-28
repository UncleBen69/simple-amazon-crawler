import electron from "electron";

import React from "react";

import { Typography, Divider, Space, Checkbox, Input, message } from "antd";

import { LoadingOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;


const ipcRenderer = electron.ipcRenderer || false;
class InitialPage extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			customURL: "",
			findAllURLS: false,
			urlsToFind: ["amzn.to"],
		};
	}

	submit = (url) =>{
		console.log("Submit");
		console.log(this.state);
		
		url = url.toLowerCase();

		console.log(url);
		if(url){
			// Error checking
			try {
				// eslint-disable-next-line no-unused-vars
				const completedURL = new URL(url);

				this.props.titleChange((
					<span>
						<LoadingOutlined />
						Crawling {completedURL.host}
					</span>
				));

				// Pass up to main component that we are loading now on url
				this.props.InitialPageSubmit(url, completedURL.host, this.state.findAllURLS);

				let data;

				let {id} = this.props;
	
				if(this.state.findAllURLS){
					console.log("Data is with ALL URLS ON");
					data = {
						id,
						url,
						findURLS: false
					};
				}else{
					console.log("Data is with ALL URLS OFF");
					// Check if Custom URL
					if(this.state.customURL){
						data = {
							id,
							url,
							findURLS: [
								...this.state.urlsToFind,
								this.state.customURL
							]
						};
					}else{
						data = {
							id,
							url,
							findURLS: this.state.urlsToFind,
						};
					}
				}
				
	
				if (ipcRenderer) {
					ipcRenderer.send("crawl::submit", JSON.stringify(data));
				}


			} catch (error) {
				// See if the cause is missing HTTP
				if(!url.includes("http")){
					message.error("Missing HTTP or HTTPS");
				}else{
					message.error("Invalid URL");
				}
			}
		}else{
			message.error("Please enter an URL");
		}
		
	}

	allURLs = (e) => {
		console.log(`checked = ${e.target.checked}`);
		
		this.setState({
			findAllURLS: e.target.checked
		});
	}

	onChange =(checkedValues) => {
		console.log("checked = ", checkedValues);
		this.setState({
			urlsToFind: checkedValues
		});
	}

	handleInputChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;
		this.setState({
			[name]: value,
		});
	};

	render(){
		const plainOptions = ["amazon.com", "amzn.to"];

		return(
			<>
				<div className="container">
					<Title level={3}>Website Crawler & Amazon Link Expander</Title>

					<Divider />
		
					<Search
						placeholder="Page URL"
						enterButton="Crawl"
						size="large"
						onSearch={value => this.submit(value)}
						loading={this.props.loading}
						defaultValue={this.props.url}
						value="https://maternityglow.com/"
					/>

					<Divider />

					<Title level={4}>URLS to Find:</Title>
					<Space>
						<Checkbox onChange={this.allURLs} defaultValue={this.state.findAllURLS}>Show All</Checkbox>
						<Checkbox.Group options={plainOptions} defaultValue={["amzn.to"]} onChange={this.onChange} disabled={this.state.findAllURLS}/>
						<Input placeholder="Custom URL" name="customURL" value={this.state.customURL} onChange={this.handleInputChange} disabled={this.state.findAllURLS}/>
					</Space>
				</div>

				<style global jsx>{`
					.container .ant-divider{
						border-top: 1px solid #f1f3f4!important;
					}
					.ant-checkbox-wrapper > span{
						color: #f1f3f4!important; 
					}
				`}</style>
			</>
		);
	}
}

export default InitialPage;