import React from "react";

import { CSVLink } from "react-csv";

import CustomTable from "./Table";

import {
	Typography,
	Table,
	Divider,
	Button,
	Space,
	Tooltip,
} from "antd";

import { CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;

class TableDisplay extends React.Component{
	constructor(props){
		super(props);

		this.state = {

		};
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
					<Space size="middle" align="center" >
						<Tooltip placement="bottom" title="Click to reset">
							<Button type="primary" icon={<CloseOutlined />} onClick={this.props.reset}/>
						</Tooltip>
						
						<Tooltip placement="bottom" title={`Crawled: ${this.props.url}`}>
							<Title level={2} style={{marginBottom: 0}}>Done Crawling</Title>
						</Tooltip>

						<Button loading={this.props.loading} disabled={this.props.expanded} type="primary" size="large" onClick={this.props.expandURLS}>Expand URLS</Button>
						<Button loading={this.props.loading} size="large" onClick={this.downloadCSV}><CSVLink filename={`${this.props.host}_amazonlinks.csv`} data={this.props.amzurls} headers={headers}>Download CSV</CSVLink></Button>
					</Space>

					<Divider />

					<Title level={3}>{`${this.props.amzurls.length} URLS found on ${this.props.pageNumber} Pages`}</Title>

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

					<CustomTable data={this.props.amzurls} loading={this.props.loading} expanded={this.props.expanded}/>

					
				</div>

				<style global jsx>{`
					.bodyPadding{
						padding: 15px;
					}
					.ant-table-cell > .ant-typography{
						color: rgba(0, 0, 0, 0.85)!important; 
					}
				`}</style>
			</>
		);
	}
}

export default TableDisplay;