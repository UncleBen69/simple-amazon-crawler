module.exports = {
	webpack: (defaultConfig) => {
		// do some stuff here
		let config = defaultConfig;

		/*
		config.plugins = defaultConfig.plugins.concat([
			new ThreadsPlugin()
		]);
		*/
		return config;
	},
};