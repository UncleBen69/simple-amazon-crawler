import React from "react";


import Crawler from "./Crawler";
import Search from "./Search";

import NewWindowCard from "./NewWindowCard";

class NewPage extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			selected: false,
			content: null,
			options: [
				{name: "Open Crawler", type: "crawler", content: <Crawler titleChange={this.titleChange} id={this.props.id} />},
				{name: "Open Search and Replace", type: "search", content: <Search titleChange={this.titleChange} />}
			]
		};
	}

	titleChange = (Title) => {
		this.props.titleChange(Title, this.props.id);
	}

	open = (Page) => {
		console.log("New Page", Page);

		this.setState({
			selected: true,
			content: Page
		});
		
		console.log(this.state);
	}

	render(){
		const {selected, content, options} = this.state;

		if(selected == false){
			return(
				<>
					<div className="centered">
						<div className="container">
							{options.map((item, index) => (
								<NewWindowCard item={item} onClick={()=> this.open(item.content)} key={index} />
							))}
						</div>
					</div>

					<style jsx>{`
						.centered {
							position: fixed;
							top: 50%;
							left: 50%;
							/* bring your own prefixes */
							transform: translate(-50%, -50%);
							color: #f1f3f4; 
						}
						.container{
							display: flex;
						}
					`}</style>
				</>
			);
		}
		else{
			return(
				<>
					{content}
				</>
			);
		}
	}
}

export default NewPage;