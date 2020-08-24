import electron from "electron";

import React from "react";

import {
	Modal
} from "antd";


import { LoadingOutlined, CheckOutlined, ExclamationOutlined } from "@ant-design/icons";


import InitialPage from "./InitialPage";
import WaitingSpinner from "./WaitingSpinner";
import TableDisplay from "./TableDisplay";


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
			expanded: false,
			tags: [],
			uniqueDomains: [],
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

	InitialPageSubmit = (url, host, find) => {
		console.log("Initial Submit", url, host, find);
		this.setState({
			loading: true,
			url: url,
			id: this.props.id,
			host: host,
			findAllURLS: find,
		});
	}

	newPageNumber = (number) => {
		this.setState({
			pageNumber: number
		});
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

	reset = () => {
		console.log("Reset");
		this.setState({
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
		if(!this.state.crawling){
			return(
				<InitialPage 
					loading={this.state.loading}
					url={this.state.url}
					titleChange={this.props.titleChange}
					id={this.props.id}
					InitialPageSubmit={this.InitialPageSubmit}

				/>
			);
		}
		else if (this.state.crawling === true){
			return(
				<WaitingSpinner 
					id={this.props.id}
					newPageNumber={this.newPageNumber}
				/>
			);
		}
		else if (this.state.crawling === "done"){
			return(
				<TableDisplay 
					expanded={this.state.expanded}
					url={this.state.url}
					loading={this.state.loading}
					findAllURLS={this.state.findAllURLS}
					amzurls={this.state.amzurls}
					pageNumber={this.state.pageNumber}
					tags={this.state.tags}
					uniqueDomainsArray={this.state.uniqueDomainsArray}
					host={this.state.host}

					reset={this.reset}
					expandURLS={this.expandURLS}
				/>
			);
		}
		
	}
}

export default Crawler;
