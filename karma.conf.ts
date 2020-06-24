/**
 * @file karma测试配置，放弃了karma-typescript，不支持相对导入，采用了webpack
 * @author kaivean
 */

export default (config: any) => {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        client: {
            jasmine: {
                random: false,
            },
        },

        // list of files / patterns to load in the browser
        files: [
            'test/head-conf.js', // 先加载
            'dist/spy-head.js', // 先加载
            // 'src/index.ts',
            // 'test/**/basicSpec.ts',
            // 'test/**/headSpec.ts',
            // 'test/**/metricSpec.ts',
            // 'test/**/*Spec.ts',
            {
                pattern: 'test/**/*Spec.ts',
                watched: true, // 监听变化
                included: true, // script加载到页面里
                served: true, //  be served by Karma's webserver
                nocache: false, // 为了保证测试到一些case，比如lcp等
            },
        ],

        // list of files / patterns to exclude
        exclude: [

        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/**/*.ts': ['webpack'],
        },

        karmaTypescriptConfig: {
            exclude: ['node_modules'],
            include: ['test/**/*.ts'],
            // transformPath(filepath: string) {
            //   return filepath.replace(/\.(ts|tsx)$/, '.js');
            // }
            // tsconfig: './tsconfig.json',
        },

        webpack: {
            mode: 'development',
            devtool: 'source-map',
            resolve: {
                extensions: ['.ts', '.js'],
            },
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
                                options: {
                                    // cacheDirectory: true // 缓存 loader 的执行结果, 默认的缓存目录 node_modules/.cache/babel-loader
                                    // babelrc: false,
                                    // presets: [
                                    //     [
                                    //         '@babel/preset-env',
                                    //         {
                                    //             useBuiltIns: 'usage',
                                    //             corejs: 3,
                                    //             targets: [
                                    //                 '> 1%',
                                    //                 'last 2 versions',
                                    //                 'ie >= 6',
                                    //                 'android >= 2.3',
                                    //                 'ios >= 7',
                                    //             ],
                                    //             debug: true,
                                    //         },
                                    //     ],
                                    // ],
                                },
                            },
                            {
                                loader: 'ts-loader',
                                options: {
                                    // 默认的tsconfig.json是用来node编译执行webpack配置等文件的
                                    // tsconfig.src.json是 项目源码 编译配置的
                                    configFile: 'tsconfig.src.json',
                                    // 加快编译速度
                                    // transpileOnly: true
                                    // appendTsxSuffixTo: [/\.atom$/]
                                },
                            },
                        ],
                        exclude: [
                            // resolve('node_modules'),
                        ],
                    },
                ],
            },
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'kjhtml'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
    });
};
