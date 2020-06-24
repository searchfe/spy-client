/**
 * @file webpack config for production
 * @author kaivean
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
// import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import baseWebpackConfig from './webpack.base.config';

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const config: webpack.Configuration = merge(
    baseWebpackConfig,
    {
        mode: 'production',

        // devtool: 'source-map',
        output: {
            filename: '[name].esm.js',
        },

        // webpack官方插件： https://webpack.js.org/plugins/
        plugins: [

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
            moduleIds: process.env.DEBUG ? 'named' : 'hashed',
            minimize: false,

            // minimize: true,
            // minimizer: [
            //      new UglifyJsPlugin({
            //         // sourceMap: true
            //         // // Enable file caching. Default path to cache directory:
            //         // // node_modules/.cache/uglifyjs-webpack-plugin.
            //         // cache: true,
            //         // parallel: true, //  Default number of concurrent runs: os.cpus().length - 1.
            //         // uglifyOptions: {
            //         //     warnings: false, // 警告信息
            //         //     compress: false, // 是否压缩，不压缩为 false
            //         //     mangle: false, // Note `mangle.properties` is `false` by default.
            //         //     /* eslint-disable fecs-camelcase */
            //         //     drop_console: true,
            //         //     drop_debugger: true
            //         //      /* eslint-disable fecs-camelcase */
            //         // }
            //     }),
            // ],
        },
    }
);

export default [config];
