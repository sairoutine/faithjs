'use strict';
/* global process __dirname */
const MODE = process.env.MODE || 'development';
const enabledSourcemap = (MODE === 'development');
var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

const js = {
	mode: MODE,
	devtool: enabledSourcemap ? 'eval-cheap-module-source-map' : false,
	entry: `${ __dirname }/src/js/main.js`,
	output: {
		path: `${ __dirname }/public/js/`,
		filename: 'main.js',
		publicPath: `/js/`,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: ['babel-loader'],
				exclude: /node_modules/,
			},
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'eslint-loader',
				options: {
					// fix wrong files automatically
					fix: true,
				},
			},
		],
	},
	devServer: {
		port: 3000,
		static: {
			directory: `${ __dirname }/public/`,
		},
		open: true,
	},
	  plugins: [
		new WebpackBuildNotifierPlugin({
			suppressSuccess: "initial",
		})
	],
};

module.exports = [js];
