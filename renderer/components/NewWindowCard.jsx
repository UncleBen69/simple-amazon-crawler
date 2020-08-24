import Tilt from "react-parallax-tilt";

import { Space } from "antd";

import {
	PlusOutlined,
	DesktopOutlined,
	SearchOutlined,
	QuestionOutlined
} from "@ant-design/icons";

const NewWindowCard = (props) => {

	let icon = <></>;
	if(props.item.type === "crawler"){
		icon = <DesktopOutlined style={{ fontSize: "10vh" }} />;
	}
	else if(props.item.type === "search"){
		icon = <SearchOutlined style={{ fontSize: "10vh" }} />;
	}else{
		icon = <QuestionOutlined style={{ fontSize: "10vh" }} />;
	}
	return(
		<>
			<Tilt scale={1.15} transitionSpeed={2500} style={{margin: "0px 4vw"}}>
				<div className="element" onClick={props.onClick}>
					<Space direction="vertical" align="center" >
						{icon}
						{props.item.name}

						<PlusOutlined style={{ fontSize: "50px" }} />

					</Space>
				</div>
			</Tilt>
			<style jsx>{`
				.element{
					border-radius: 5px;
					height: 40vh;
					width: 20vw;
					background-color: #202124;
					box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
					text-align: center;
					padding: 0 2vw;

					font-size: 3vh;
					font-weight: 800;

					display: flex;
  					flex-direction: column;
  					justify-content: center;
				}
			`}</style>
		</>
	);
};

export default NewWindowCard;