const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        app: ['./index.js']
    },
    devtool: 'cheap-module-source-map',
    output: {
        path: __dirname + '/static',
        filename: 'index.[hash].js',
        publicPath: '/'
    },
    module: {
        loaders: [
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.s[ac]ss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
            { test: /\.js$/, use: ['babel-loader'], exclude: /node_modules/ },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss', '.css', '.json']
    },
    plugins: [
        new webpack.IgnorePlugin(/.js.map$/),
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),
        new CleanWebpackPlugin('static/**'),
        new CopyWebpackPlugin(['roms/**'])
    ]
};