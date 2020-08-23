import Papa from "papaparse";
import React from "react";

import { Divider, Typography, Input, Button, Row, Col} from "antd";


const { Title } = Typography;

class Search extends React.Component {
	constructor() {
		super();
		this.state = {
			csvfile: null,
			sqlfile: null,
			completeSqlFile: null,
			sqlfilename: null,
			trackingCodes: null,
			newtracking: null,
			newtracking2: null,
		};
		this.updateData = this.updateData.bind(this);
	}

	componentDidMount() {
		this.props.titleChange("Search");
	}

	// CSV
	handleChange = (event) => {
		//console.log(event.target.files[0]);

		// Check if it's a CSV file
		let csvname = event.target.files[0].name;
		console.log(csvname, csvname.substr(csvname.length - 4));
		// Check if it's an SQL file
		if (csvname.substr(csvname.length - 4) !== ".csv") {
			console.log("doesn't end in .csv");
			alert("Please upload an .csv file");
			return;
		}

		this.setState({
			csvfile: event.target.files[0],
		});
	};

	importCSV = () => {
		const { csvfile } = this.state;
		if (!csvfile) {
			alert("Please upload an CSV file before continuing");
			return;
		}
		Papa.parse(csvfile, {
			complete: this.updateData,
			header: false,
		});
	};

	updateData(result) {
		var data = result.data;
		// Where the completed CSV Data is
		console.log(data);

		// Check if SQL data exists
		if (!this.state.sqlfile) {
			alert("Please upload an SQL file before continuing");
			return;
		}

		// Check if Tracking ID's exist
		if (
			(this.state.oldtracking && !this.state.newtracking) ||
			(!this.state.oldtracking && this.state.newtracking)
		) {
			alert("Please add tracking ID's");
			return;
		}
		if (
			(this.state.oldtracking2 && !this.state.newtracking2) ||
			(!this.state.oldtracking2 && this.state.newtracking2)
		) {
			alert("Please add tracking ID's");
			return;
		}

		let newsqlfile = this.state.sqlfile;

		for (let i = 0; i < data.length; i++) {
			const element = data[i];

			console.log(`Find "${element[0]}", replace with "${element[1]}"`);

			// Check if the first index is a title
			if (i === 0) {
				console.log("Skipping Title");
			}
			// Check if field if blank
			else if (element[0] === "" ?? element[1] === "") {
				console.log("Blank element");
			}
			// If expanded to blank
			else if (element[1] === "amazon.com"){
				console.log("Normal Amazon.com link in element");
			}
			// Check if field is undefined
			else if (element[0] === undefined ?? element[1] === undefined) {
				console.log("Undefined element");
			} else {
				// Replace
				console.log("Replace");

				// Encode URL
				let replaceWith = element[1].replace(/'/g, "%27");

				// Replace
				let re = new RegExp(element[0], "g");
				newsqlfile = newsqlfile.replace(re, replaceWith);
			}

			if (i == data.length - 1) {
				console.log("Final Iteration should commit file");

				if (this.state.oldtracking && this.state.newtracking) {
					// First replace all tracking ID's
					let reg2 = new RegExp(this.state.oldtracking, "g");
					newsqlfile = newsqlfile.replace(
						reg2,
						this.state.newtracking
					);
				}

				if (this.state.oldtracking2 && this.state.newtracking2) {
					// First replace all tracking ID's
					let reg3 = new RegExp(this.state.oldtracking2, "g");
					newsqlfile = newsqlfile.replace(
						reg3,
						this.state.newtracking2
					);
				}

				this.setState({ newsqlfile: newsqlfile });

				// Download file

				const element = document.createElement("a");
				const file = new Blob([this.state.newsqlfile], {
					type: ".sql",
				});
				element.href = URL.createObjectURL(file);
				element.download = "replaced_" + this.state.sqlfilename;
				document.body.appendChild(element); // Required for this to work in FireFox
				element.click();
			}
		}
	}

	// Database
	handleFile = (e) => {
		const content = e.target.result;
		//console.log("file content", content);

		console.log("File shit", e.target);
		// You can set content in state and show it in render.
		this.setState({ sqlfile: content });
	};

	handleChangeFile = (file) => {
		// Get SQL file name

		let sqlname = file.target.files[0].name;
		console.log(sqlname, sqlname.substr(sqlname.length - 4));
		// Check if it's an SQL file
		if (sqlname.substr(sqlname.length - 4) !== ".sql") {
			console.log("doesn't end in .sql");
			alert("Please upload an .sql file");
			return;
		}
		this.setState({ sqlfilename: sqlname });

		let fileData = new FileReader();
		fileData.onloadend = this.handleFile;
		fileData.readAsText(file.target.files[0]);
	};

	handleInputChange = (event) => {
		const target = event.target;
		const value = target.value;
		const name = target.name;
		this.setState({
			[name]: value,
		});
	};

	render() {
		//console.log(this.state.csvfile);
		//console.log(this.state.sqlfile);

		return (
			<React.Fragment>  
				<div className="container">
					<Title level={3}>Search and Replace</Title>
			
					<Divider />

					<Row>
						<Col span={12}>
							<Title level={4}>SQL File:</Title>

							<input
								type="file"
								onChange={(e) => this.handleChangeFile(e)}
								accept=".sql"
							/>
						</Col>
						<Col span={12}>
							<Title level={4}>CSV File:</Title>
							<input
								className="csv-input"
								type="file"
								ref={(input) => {
									this.filesInput = input;
								}}
								name="file"
								placeholder={null}
								onChange={this.handleChange}
								accept=".csv"
							/>
						</Col>
					</Row>		

					<p />

					<Title level={4}>Tracking IDs</Title>

					<Row>
						<Col span={11}>
							<Input
								placeholder="Old ID"
								name="oldtracking"
								value={this.state.oldtracking}
								onChange={this.handleInputChange}
							/>
						</Col>
						<Col span={1}>

						</Col>
						<Col span={11}>
							<Input
								placeholder="New ID"
								name="newtracking"
								value={this.state.newtracking}
								onChange={this.handleInputChange}
							/>
						</Col>
					</Row>

					<p />
					
					<Row>
						<Col span={11}>
							<Input
								placeholder="Old ID 2"
								name="oldtracking2"
								value={this.state.oldtracking2}
								onChange={this.handleInputChange}
							/>
						</Col>
						<Col span={1}>

						</Col>
						<Col span={11}>
							<Input
								placeholder="New ID 2"
								name="newtracking2"
								value={this.state.newtracking2}
								onChange={this.handleInputChange}
							/>
						</Col>
					</Row>
							
					<p />
                        
					<Button type="primary" onClick={this.importCSV} size="large">
                            Convert file now
					</Button>
				</div>

				<style global jsx>{`
					input[type="file"]{
						color: #f1f3f4;
					}
					.ant-typography{
						color: #f1f3f4!important; 
					}
					.ant-divider{
						border-top: 1px solid #f1f3f4!important;
					}
				`}</style>
			</React.Fragment>
		);
	}
}

export default Search;
