/**
 * @file karma测试配置，放弃了karma-typescript，不支持相对导入，采用了webpack
 * @author kaivean
 */


// const webpack = require('webpack');

module.exports = config => {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'karma-typescript'],

        // plugins: ['karma-webpack'],
        client: {
            jasmine: {
                random: false,
            },
        },

        // list of files / patterns to load in the browser
        files: [
            'dist/spy-head.js', // 先加载
            // 'dist/spy-client.js', // 先加载
            // 'src/index.ts',
            // 'test/**/basicSpec.ts',
            // 'test/**/headSpec.ts',
            // 'test/**/metricSpec.ts',
            // 'test/**/*Spec.ts',
            {
                pattern: 'test/**/*Spec.ts',
                watched: false, // 监听变化
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
            'test/**/*.ts': ['karma-typescript'],
        },

        karmaTypescriptConfig: {
            exclude: ['node_modules'],
            include: ['test/**/*.ts'],
            compilerOptions: {
                baseUrl: '.',
                paths: {
                    'spy-client': ['dist/spy-client.js'],
                },
            },
            transformPath(filepath) {
                return filepath.replace(/\.(ts|tsx)$/, '.js');
            },
            // tsconfig: './tsconfig.json',
        },

        reporters: ['progress', 'kjhtml', 'karma-typescript'],

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

        // you can define custom flags
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox'],
            },
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
    });

    if (process.env.TRAVIS) {
        config.set({
            browsers: ['ChromeHeadless', 'ChromeHeadlessNoSandbox'],
        });
    }
};
