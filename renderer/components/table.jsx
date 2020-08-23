import React from "react";

import { Table, Input, Button, Space, Typography } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;

class CustomTable extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			searchText: "",
			searchedColumn: "",
		};
	}
		
	
		getColumnSearchProps = dataIndex => ({
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Input
						ref={node => {
							this.searchInput = node;
						}}
						placeholder={`Search ${dataIndex}`}
						value={selectedKeys[0]}
						onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
						onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
						style={{ width: 188, marginBottom: 8, display: "block" }}
					/>
					<Space>
						<Button
							type="primary"
							onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
							icon={<SearchOutlined />}
							size="small"
							style={{ width: 90 }}
						>
							Search
						</Button>
						<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
							Reset
						</Button>
					</Space>
				</div>
			),
			filterIcon: filtered => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />,
			onFilter: (value, record) =>
				record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : "",
			onFilterDropdownVisibleChange: visible => {
				if (visible) {
					setTimeout(() => this.searchInput.select());
				}
			},
			render: text =>
				this.state.searchedColumn === dataIndex ? (
					<Highlighter
						highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
						searchWords={[this.state.searchText]}
						autoEscape
						textToHighlight={text ? text.toString() : ""}
					/>
				) : (
					text
				),
		});
	
		handleSearch = (selectedKeys, confirm, dataIndex) => {
			confirm();
			this.setState({
				searchText: selectedKeys[0],
				searchedColumn: dataIndex,
			});
		};
	
		handleReset = clearFilters => {
			clearFilters();
			this.setState({ searchText: "" });
		};
	
		render() {
			let columns;
			if(this.props.expanded){
				columns = [
					{
						title: "URL",
						dataIndex: "url",
						key: "url",
						...this.getColumnSearchProps("url"),
					},
					{
						title: "Expanded URL",
						dataIndex: "expanded",
						key: "expanded",
						...this.getColumnSearchProps("expanded"),
					}
				];
			}else{
				columns = [
					{
						title: "URL",
						dataIndex: "url",
						key: "url",
						...this.getColumnSearchProps("url"),
					}
				];
			}
		

			return <Table 
				tableLayout="fixed" 
				columns={columns} 
				dataSource={this.props.data} 
				bordered={true} 
				pagination={false} 
				loading={this.props.loading}
				expandable={{
					expandedRowRender: record => (
						<>
							<Title level={4} style={{ margin: 0 }}>Found on:</Title>
							{record.foundOn.map((object, i) => <p style={{ margin: 0 }} key={i}>{object}</p>)}
						</>
					),
					rowExpandable: record => record.url,
				}}
			/>;
		}
}

export default CustomTable;