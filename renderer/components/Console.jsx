
const Console = (props) => {
	return(
		<>
			<div className="debugTextContainer">
				{props.data.map((data, index) => (
					<span key={index}>{data.text}</span>
				))}
			</div>
			


			<style jsx>{`
				.debugTextContainer{
					padding: 5px;
					color: #f1f3f4;
					display: block;

					white-space:nowrap
				}
				.debugTextContainer > span{
					display: block;
					color: white;
					font-family: Monospace;
					padding: 0px;
					word-wrap: break-word;
				}
			`}</style>
		</>
	);
};

export default Console;