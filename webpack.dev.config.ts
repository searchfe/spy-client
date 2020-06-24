/**
 * @file webpack config for dev
 * @author kaivean
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import baseWebpackConfig from './webpack.base.config';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const config: webpack.Configuration = merge(
    baseWebpackConfig,
    {
        mode: 'development',
        // watch: true,
        // watchOptions: {
        //     aggregateTimeout: 2000, // The default
        //     ignored: /node_modules/
        // },

        output: {
            filename: '[name].js',
        },

        devtool: 'source-map',

        // webpack官方插件： https://webpack.js.org/plugins/
        plugins: [
            // ...plugins,
            // new WriteFilePlugin(),
        ],
        module: {
            // webpack官方loader：https://www.webpackjs.com/loaders/
            rules: [],
        },

        optimization: {
            // Tells webpack which algorithm to use when choosing module ids.
            // Short hashes as ids for better long term caching.
            // 开发的时候为 `named`
            // https://webpack.js.org/configuration/optimization/#optimization-moduleids
            // moduleIds: 'hashed',
        },
    }
);

export default config;
