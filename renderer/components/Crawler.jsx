import electron from "electron";

import { CSVLink } from "react-csv";
import React from "react";

import {
	Typography,
	Table,
	Spin,
	Divider,
	Input,
	Button,
	Space,
	Checkbox,
	Tooltip,
	message,
	Modal
} from "antd";
import "antd/dist/antd.css";


import { CloseOutlined, LoadingOutlined, CheckOutlined, ExclamationOutlined } from "@ant-design/icons";


import CustomTable from "../components/table";
import Console from "../components/Console";


const { Search } = Input;	
const { Title } = Typography;

// prevent SSR webpacking
const ipcRenderer = electron.ipcRenderer || false;

class Crawler extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			url: "",
			loading: false,
			crawling: false,
			amzurls: [],
			foundURL: "",
			expanded: false,
			urlsToFind: ["amzn.to"],
			tags: [],
			customURL: "",
			findAllURLS: false,
			uniqueDomains: [],
			pageNumber: 0,
			pages: [],
			host: null,
		};
	}

	// IPC Message Handler
	componentDidMount() {
		// componentDidMount()

		// Set Title
		this.props.titleChange("New Crawler");

		if (ipcRenderer) {
			// Listeners
			ipcRenderer.on("crawl::start", (event, arg) => {
				let data = JSON.parse(arg);

				console.log(data);
				// Check if crawl is started for current window

				if(data.id !== this.props.id) return;

				this.setState({
					crawling: true
				});
			});

			ipcRenderer.on("crawl::complete", (event, arg) => {
				let data = JSON.parse(arg);

				if(data.id !== this.props.id) return;
				
				this.setState({
					loading: false
				});

				this.props.titleChange((
					<span>
						<CheckOutlined />
						Crawled {this.state.host}
					</span>
				));

				console.log("Array of URLS: ", data.urls);

				if(data.searchedFor == false){
					// Run for each URL
					let uniqueDomains = new Set();
					for (let i = 0; i < data.urls.length; i++) {
						const element = data.urls[i].url;

						//console.log(`Running for ${element}`)

						try {
							const url = new URL(element);
							//console.log(url.hostname)
							uniqueDomains.add(url.hostname);
						} catch (error) {
							console.log(error);
						}

						if(i == data.urls.length-1){
							//console.log("Setting to state")
							console.log(uniqueDomains);
						
							let uniqueDomainsArray = [];
							for (let x = 0; x < [...uniqueDomains].length; x++) {
								const currentURL = [...uniqueDomains][x];
								//console.log("Inside Unique = ", currentURL)

								if(currentURL == "") continue;
								
								uniqueDomainsArray.push({
									domain: currentURL
								});

								if(x == [...uniqueDomains].length - 1){
									//console.log("On Final itteration of loop")
									this.setState({
										uniqueDomainsArray,
										crawling: "done",
										amzurls: data.urls
									});
								}
							}

						}
					}
				}else{
					this.setState({
						crawling: "done",
						amzurls: data.urls
					});
				}
			});

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
			});

			ipcRenderer.on("expand::complete", (event, arg) => {
				let data = JSON.parse(arg);
				
				if(data.id !== this.props.id) return;

				this.props.titleChange((
					<span>
						<CheckOutlined />
						Expanded {this.state.host}
					</span>
				));

				let arrayOfTags = [];

				for (let i = 0; i < data.tags.length; i++) {
					const element = data.tags[i];
					arrayOfTags.push({
						tag: element
					});
				}

				this.setState({
					loading: false,
					amzurls: data.urls,
					expanded: true,
					tags: arrayOfTags
				});
			});

			ipcRenderer.on("expand::error", (event, arg) => {
				let data = JSON.parse(arg);
				
				if(data.id !== this.props.id) return;

				this.props.titleChange((
					<span>
						<ExclamationOutlined />
						Error Expanding {this.state.host}
					</span>
				));

				Modal.error({
					title: "Unknown Error in Expanding",
					content: String(data.error),
				});
				this.setState({
					loading: false,
				});
			});
		}
	
		return () => {
			// componentWillUnmount()
			if (ipcRenderer) {
				// unregister it
				ipcRenderer.removeAllListeners();
			}
		};
	}

	submit = (url) =>{
		console.log("Submit");
		console.log(this.state);
		
		url = url.toLowerCase();

		/*
		var notif = new window.Notification('Crawler Started', {
			body: "Crawler Start",
			silent: true // We'll play our own sound
		})
		*/

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

				this.setState({
					loading: true,
					url: url,
					id: this.props.id,
					host: completedURL.host
				});
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

	expandURLS = () => {
		console.log("Expand URLS");

		if(this.state.amzurls){
			this.setState({
				loading: true
			});
			
			this.props.titleChange((
				<span>
					<LoadingOutlined />
					Expanding {this.state.host}
				</span>
			));

			let data = {
				id: this.props.id,
				urls: this.state.amzurls,
			};
			console.log(data);
			if (ipcRenderer) {
				ipcRenderer.send("expand::submit", JSON.stringify(data));
			}
		}
	}

	
	onChange =(checkedValues) => {
		console.log("checked = ", checkedValues);
		this.setState({
			urlsToFind: checkedValues
		});
	}
	
	allURLs = (e) => {
		console.log(`checked = ${e.target.checked}`);
		
		this.setState({
			findAllURLS: e.target.checked
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

	reset = () => {
		console.log("Reset");
		this.setState({
			url: "",
			loading: false,
			crawling: false,
			amzurls: [],
			foundURL: "",
			expanded: false,
			urlsToFind: ["amzn.to"],
			tags: [],
			findAllURLS: false,
			uniqueDomains: [],
			pageNumber: 0,
			pages: [],
			host: null,
		});	
	}

	render(){
		var content;

		if(!this.state.crawling){
			const plainOptions = ["amazon.com", "amzn.to"];
			content = (
				<div className="container">
					<Title level={3}>Website Crawler & Amazon Link Expander</Title>

					<Divider />
				
					<Search
						placeholder="Page URL"
						enterButton="Crawl"
						size="large"
						onSearch={value => this.submit(value)}
						loading={this.state.loading}
						value="http://sleekdwellings.com/"
					/>

					<Divider />

					<Title level={4}>URLS to Find:</Title>
					<Space>
						<Checkbox onChange={this.allURLs} defaultValue={this.state.findAllURLS}>Show All</Checkbox>
						<Checkbox.Group options={plainOptions} defaultValue={["amzn.to"]} onChange={this.onChange} disabled={this.state.findAllURLS}/>
						<Input placeholder="Custom URL" name="customURL" value={this.state.customURL} onChange={this.handleInputChange} disabled={this.state.findAllURLS}/>
					</Space>
				</div>
			);
		}
		else if (this.state.crawling === true){
			content = (
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
								overflow-y: scroll;
								text-align: center;
							}
						`}</style>
					</Space>
				</div>
			);
		}
		else if (this.state.crawling === "done"){
			let tagColumns = [
				{
					title: "Tags",
					dataIndex: "tag",
					key: "tag",
				}
			];
			let domainColumns = [
				{
					title: "Domains:",
					dataIndex: "domain",
					key: "domain",
				}
			];
			let headers;
			if(this.state.expanded){
				headers = [
					{ label: "URL", key: "url" },
					{ label: "Expanded", key: "expanded" }
				];
			}else{
				headers = [
					{ label: "URL", key: "url" },
				];
			}

			content = (
				<div className="bodyPadding">
					<Space size="middle" align="center">
						<Tooltip placement="bottom" title="Click to reset">
							<Button type="primary" icon={<CloseOutlined />} onClick={this.reset}/>
						</Tooltip>
						
						<Tooltip placement="bottom" title={`Crawled: ${this.state.url}`}>
							<Title level={2}>Done Crawling</Title>
						</Tooltip>

						<Button loading={this.state.loading} disabled={this.state.expanded || this.state.findAllURLS} type="primary" size="large" onClick={this.expandURLS}>Expand URLS</Button>
						<Button loading={this.state.loading} size="large" onClick={this.downloadCSV}><CSVLink filename={"siteAmazonLinks.csv"} data={this.state.amzurls} headers={headers}>Download CSV</CSVLink></Button>
					</Space>

					<Divider />

					<Title level={3}>{`${this.state.amzurls.length} URLS found on ${this.state.pageNumber} Pages`}</Title>

					{/* If URLS are Amazon and Expanded */}
					{this.state.expanded ? (
						<>
							<Divider />

							<Table tableLayout="fixed" dataSource={this.state.tags} columns={tagColumns} bordered={true} pagination={false} loading={this.state.loading} size="small"/>
						</>
					):(<> </>)}

					{/* If finding all URLS */}
					{this.state.findAllURLS ? (
						<>
							<Divider />

							<Table tableLayout="fixed" dataSource={this.state.uniqueDomainsArray} columns={domainColumns} bordered={true} pagination={false} loading={this.state.loading} size="small"/>
						</>
					):(<> </>)}

					<Divider />

					<CustomTable data={this.state.amzurls} loading={this.state.loading} expanded={this.state.expanded}/>

					
				</div>
			);
		}
		return (
			<React.Fragment>

				{content}
				<style global jsx>{`
					.ant-typography{
						color: #f1f3f4!important; 
					}
					.ant-divider{
						border-top: 1px solid #f1f3f4!important;
					}
					.ant-checkbox-wrapper > span{
						color: #f1f3f4!important; 
					}
					.bodyPadding{
						padding: 15px;
					}
					/*
					.ant-table{
						background-color: #323639!important;
					}
					*/
				`}</style>
			</React.Fragment>
		);
	}
}

export default Crawler;
