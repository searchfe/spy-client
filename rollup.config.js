/**
 * @file webpack 4不支持旧浏览器，采用rollup支持旧浏览器打包配置
 * @author kaivean
 */

import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
// 这个官方正式插件有bug
// import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

const isDevelopment = process.env.NODE_ENV === 'development';

function genPlugins(opt = {}) {
    const plugins = [
        resolve({
            node: false,
            browser: true,
        }),
    ];

    plugins.push(commonjs());
    plugins.push(typescript({
        tsconfig: 'tsconfig.src.json',
    }));

    if (opt.head) {
        plugins.push(babel({
            // babelrc: false,
            presets: [
                [
                    '@babel/preset-env',
                    {
                        useBuiltIns: false, //  spy-head不做polyfill，为了节省体积
                    },
                ],
            ],
            extensions: ['ts'],
        }));
    }
    else if (!opt.es6) {
        plugins.push(babel({
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
            //             debug: isDevelopment,
            //         },
            //     ],
            // ],
            extensions: ['ts'],
        }));
    }


    plugins.push(replace({
        'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
    }));

    if (opt.isMin) {
        plugins.push(uglify());
    }

    return plugins;
}

export default [
    // *********************
    // spyClient
    // *********************

    // umd风格全兼容
    {
        input: 'src/spy-client.ts',
        output: {
            file: 'dist/spy-client.js',
            format: 'umd',
            name: 'SpyClient',
        },
        plugins: genPlugins(),
    },
    {
        input: 'src/spy-client.ts',
        output: {
            file: 'dist/spy-client.min.js',
            format: 'umd',
            name: 'SpyClient',
        },
        plugins: genPlugins({isMin: true}),
    },

    // iife风格全兼容 一些构建模块，比如很老的fis版本无法构建umd格式模块，因此仅提供全局变量iife模式
    {
        input: 'src/spy-client.ts',
        output: {
            file: 'dist/spy-client.iife.js',
            format: 'iife',
            name: 'SpyClient',
        },
        plugins: genPlugins(),
    },
    {
        input: 'src/spy-client.ts',
        output: {
            file: 'dist/spy-client.iife.min.js',
            format: 'iife',
            name: 'SpyClient',
        },
        plugins: genPlugins({isMin: true}),
    },

    // es module风格全兼容 仅仅是es module的风格，语法和polyfill还是经过编译的
    {
        input: 'src/spy-client.ts',
        output: {
            file: 'dist/spy-client.esm.js',
            format: 'esm',
            name: 'SpyClient',
        },
        plugins: genPlugins(),
    },


    // es6代码 仅仅编译ts成es6，对语法和polyfill不做处理
    {
        input: 'src/spy-client.ts',
        output: {
            file: 'dist/spy-client.mjs',
            format: 'esm',
            name: 'SpyClient',
        },
        plugins: genPlugins({es6: true}),
    },


    // *********************
    // spy-client-basic
    // *********************

    // umd风格全兼容
    {
        input: 'src/spy-client-basic.ts',
        output: {
            file: 'dist/spy-client-basic.js',
            format: 'umd',
            name: 'SpyClient',
        },
        plugins: genPlugins(),
    },
    {
        input: 'src/spy-client-basic.ts',
        output: {
            file: 'dist/spy-client-basic.min.js',
            format: 'umd',
            name: 'SpyClient',
        },
        plugins: genPlugins({isMin: true}),
    },

    // iife风格全兼容 一些构建模块，比如很老的fis版本无法构建umd格式模块，因此仅提供全局变量iife模式
    {
        input: 'src/spy-client-basic.ts',
        output: {
            file: 'dist/spy-client-basic.iife.js',
            format: 'iife',
            name: 'SpyClient',
        },
        plugins: genPlugins(),
    },
    {
        input: 'src/spy-client-basic.ts',
        output: {
            file: 'dist/spy-client-basic.iife.min.js',
            format: 'iife',
            name: 'SpyClient',
        },
        plugins: genPlugins({isMin: true}),
    },

    // es module风格全兼容 仅仅是es module的风格，语法和polyfill还是经过编译的
    {
        input: 'src/spy-client-basic.ts',
        output: {
            file: 'dist/spy-client.esm.js',
            format: 'esm',
            name: 'SpyClient',
        },
        plugins: genPlugins(),
    },


    // es6代码 仅仅编译ts成es6，对语法和polyfill不做处理
    {
        input: 'src/spy-client-basic.ts',
        output: {
            file: 'dist/spy-client.mjs',
            format: 'esm',
            name: 'SpyClient',
        },
        plugins: genPlugins({es6: true}),
    },


    // *********************
    // spyHead
    // *********************
    // 头部JS，iife风格全兼容
    {
        input: 'src/spy-head.ts',
        output: {
            file: 'dist/spy-head.js',
            format: 'iife',
            name: '__spyclient',
        },
        plugins: genPlugins({head: true}),
    },
    {
        input: 'src/spy-head.ts',
        output: {
            file: 'dist/spy-head.min.js',
            format: 'iife',
            name: '__spyclient',
        },
        plugins: genPlugins({isMin: true, head: true}),
    },
];
