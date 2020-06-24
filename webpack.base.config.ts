/**
 * @file webpack config for base
 * @author kaivean
 */

import path from 'path';
import webpack from 'webpack';

// import CopyWebpackPlugin from 'copy-webpack-plugin';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import MiniCssExtractPlugin from 'mini-css-extract-plugin';

function resolve(dir: string): string {
    return path.join(__dirname, dir);
}

const config: webpack.Configuration = {
    context: resolve(''),
    entry: {
        'spy-client': resolve('src/spy-client.ts'),
    },
    output: {
        library: 'SpyClient',
        libraryExport: 'default',
        libraryTarget: 'umd',
        path: resolve('dist'),
    },
    resolve: {
        alias: {

        },
        extensions: ['.ts', '.js'],

        modules: [
            resolve('src'),
            resolve('node_modules'),
        ],
    },

    // 控制构建日志信息输出，在dev模式下无效，都会输出，只有在prod模式才生效
    stats: process.env.UPLOAD === 'true' ? 'errors-only' : 'normal', // https://webpack.js.org/configuration/stats/

    // webpack官方插件： https://webpack.js.org/plugins/
    plugins: [
        // // new webpack.DefinePlugin({
        //     // 'process.env': {
        //     //     NODE_ENV: JSON.stringify('production')
        //     // }
        // }),

        // 获取输出的包信息
        // new ManifestPlugin(),
    ],

    module: {
        // Ignored files should not have calls to import, require, define or any other importing mechanism.
        // This can boost build performance when ignoring large libraries.
        // webpack官方loader：https://www.webpackjs.com/loaders/
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    // 'thread-loader', // 多worker加快速度
                    {
                        loader: 'babel-loader',
                        // options: {
                        //     // cacheDirectory: true // 缓存 loader 的执行结果, 默认的缓存目录 node_modules/.cache/babel-loader
                        //     babelrc: false,
                        //     presets: [
                        //         [
                        //             "@babel/preset-env"
                        //         ]
                        //     ],
                        // },
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            // 默认的tsconfig.json是用来node编译执行webpack配置等文件的
                            // tsconfig.src.json是 项目源码 编译配置的
                            configFile: 'tsconfig.json',
                            // 加快编译速度
                            // transpileOnly: true
                            // appendTsxSuffixTo: [/\.atom$/]
                        },
                    },
                ],
                exclude: [
                    resolve('node_modules'),
                ],
            },
        ],
    },

    optimization: {
        concatenateModules: true,
        // 即使不加splitChunks，webpack也会做split chunks ，比如包含node_modules
        // https://webpack.js.org/plugins/split-chunks-plugin/
        // splitChunks: {
        //     // all, async, initial 三选一, 插件作用的chunks范围
        //     // This indicates which chunks will be selected for optimization
        //     chunks: 'all',

        //     // 如果不指定name，自动生成name的分隔符（‘runtime~[name]’）
        //     automaticNameDelimiter: '-',

        //     // 不同的mode下，这块配置不一样，因此需要主动配置，否则common不会生成
        //     // 不同mode的配置： https://webpack.docschina.org/concepts/mode
        //     minSize: 10000,
        //     maxAsyncRequests: Infinity, // Maximum number of parallel requests at an entry point.
        //     maxInitialRequests: Infinity, // Maximum number of parallel requests when on-demand loading.
        //     cacheGroups: {
        //         vendor: {
        //             name: 'vendor',
        //             test: /[\\/](node_modules|amd_modules)[\\/]/
        //         },
        //         common: {
        //             name: 'common',
        //             chunks: 'initial',
        //             test: /[\\/](common)[\\/]/,
        //             minChunks: 2
        //         },
        //         default: false
        //     }
        // },
        // runtimeChunk: {
        //     name: 'manifest'
        // }
    },
};

export default config;
