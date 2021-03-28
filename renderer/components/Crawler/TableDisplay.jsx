import electron from "electron";

import React from "react";

import { CSVLink } from "react-csv";

import CustomTable from "./Table";

const humanizeDuration = require("humanize-duration");

import {
	Typography,
	Table,
	Divider,
	Button,
	Space,
	Tooltip,
	Row,
	Col
} from "antd";

import { CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ipcRenderer = electron.ipcRenderer || false;
class TableDisplay extends React.Component{
	constructor(props){
		super(props);

		this.state = {
			time: null,
			rowsPerPage: 10
		};
	}

	componentDidMount() {
		if (ipcRenderer) {
			// Row Settings
			const settings = JSON.parse(ipcRenderer.sendSync("settings::get"));
			console.log(settings.generalSettings.rowsPerPage, "Rows");
			this.setState({
				rowsPerPage: settings.generalSettings.rowsPerPage,
			});
		}
	}

	startExpand = ()=> {
		this.props.expandURLS();

		this.interval = setInterval(() => {
			console.log("Expand Timer Running");
			// Check if finished expanding
			if(this.props.expanded) clearInterval(this.interval);

			this.setState({ 
				time: Date.now() - this.props.expandRunTime,
			});

		}, 50);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render(){
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
		if(this.props.expanded){
			// Stop timer
			clearInterval(this.interval);

			headers = [
				{ label: "URL", key: "url" },
				{ label: "Expanded", key: "expanded" }
			];
		}else{
			headers = [
				{ label: "URL", key: "url" },
			];
		}

		return(
			<>
				<div className="bodyPadding">
					<Row justify="space-between">
						<Col flex="650px">
							<Space size="middle" align="center" >
								<Tooltip placement="bottom" title="Click to reset">
									<Button type="primary" icon={<CloseOutlined />} onClick={this.props.reset}/>
								</Tooltip>
								
								<Tooltip placement="bottom" title={`Crawled: ${this.props.url}`}>
									<Title level={2} style={{marginBottom: 0}}>Done Crawling</Title>
								</Tooltip>

								<Button loading={this.props.loading} disabled={this.props.expanded} type="primary" size="large" onClick={this.startExpand}>Expand URLS</Button>
								<Button loading={this.props.loading} size="large" onClick={this.downloadCSV}><CSVLink filename={`${this.props.host}_amazonlinks.csv`} data={this.props.amzurls} headers={headers}>Download CSV</CSVLink></Button>
							</Space>
						</Col>

						<Col flex="auto">
							<div className="right">
								<Space direction="vertical" align="center">
									<Title level={4}>Crawled in:</Title>

									<Tooltip placement="bottom" title={humanizeDuration(this.props.crawlRunTime)}>
										<Title level={5}>{humanizeDuration(this.props.crawlRunTime, {maxDecimalPoints: 3})}</Title>
									</Tooltip>
								</Space>
					
								{this.props.loading || this.props.expanded ? ( 
									<Space direction="vertical" align="center" style={{paddingLeft: "25px"}}>
										<Title level={4}>Expanded in:</Title>
										
										<Tooltip placement="bottom" title={humanizeDuration(this.props.expanded? this.props.expandRunTime : null)}>
											<Title level={5}>{humanizeDuration(this.props.expanded? this.props.expandRunTime : this.state.time , {maxDecimalPoints: 3})}</Title>
										</Tooltip>
									</Space>
								) : <></>}
							</div>
						</Col>
					</Row>

					<Divider />

					<Title level={3}>{`${this.props.amzurls.length} URLS found on ${this.props.pageNumber} Pages with ${this.props.tags.length} Tags`}</Title>

					{/* If URLS are Amazon and Expanded */}
					
					<Divider />

					<Table tableLayout="fixed" dataSource={this.props.tags} columns={tagColumns} bordered={true} pagination={false} loading={this.props.loading} size="small"/>
					

					{/* If finding all URLS */}
					{this.props.findAllURLS ? (
						<>
							<Divider />

							<Table tableLayout="fixed" dataSource={this.props.uniqueDomainsArray} columns={domainColumns} bordered={true} pagination={false} loading={this.props.loading} size="small"/>
						</>
					):(<> </>)}

					<Divider />

					<CustomTable data={this.props.amzurls} loading={this.props.loading} expanded={this.props.expanded} rowsPerPage={this.state.rowsPerPage} />

					
				</div>
				
				<style jsx>{`
					.right{
						float: right;
					}
				`}</style>

				<style global jsx>{`
					.bodyPadding{
						padding: 15px;
					}
					
					.right > .ant-space > div:first-child, .right > .ant-space > div:first-child >h4{
						margin-bottom: 0px!important;
					}


					/* Dark Mode Table */
					.ant-table-thead th{
						background-color: #1d1d1d!important;
					}
					.ant-table-tbody{
						background-color: #141414;
					}
					tr, th{
						color: rgba(255, 255, 255, 0.65)!important;
					}
					.ant-table-container{
						border: 1px solid #303030!important;;
					}

					tr > .ant-table-cell{
						border-right 0!important;
						border-color: #303030!important;
					}

					.ant-table{
						background-color: #303030!important;
					}
					
					.ant-table-row:hover > .ant-table-cell {
						background-color: #262626!important;
					}
					
					.ant-table-row-expand-icon {
						background-color: #141414!important;
						border-color: #262626!important;
					}

					.ant-table-expanded-row > .ant-table-cell {
						background-color: #141414!important;
					}
					.ant-table-cell > h4 {
						color: rgba(255, 255, 255, 0.65)!important;
					}
					
					.ant-table-filter-trigger-container:hover{
						background-color: #262626!important;
					}

				`}</style>
			</>
		);
	}
}

export default TableDisplay;