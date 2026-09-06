/**
 * @file rollup 打包配置
 * @author kaivean
 *
 * 说明：
 * - 使用 @rollup/plugin-typescript 编译 ts（target 保持 ES5，兼容旧浏览器）
 * - .d.ts 声明文件由 build 脚本中的 `tsc --emitDeclarationOnly` 单独产出
 * - 压缩使用 @rollup/plugin-terser
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

function genPlugins() {
    return [
        resolve({
            browser: true,
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
        }),
    ];
}

// 各入口在 umd/iife 下的全局变量名
const GLOBAL_NAMES = {
    'spy-client': 'SpyClient',
    'spy-client-basic': 'SpyClient',
    'spy-head': '__spyHead',
    'spy-local-cache': 'SpyLocalCache',
};

// 需要额外产出 iife / esm 格式的入口（与旧配置保持一致）
const ESM_ENTRIES = new Set(['spy-client', 'spy-client-basic']);

function genOutputs(entry) {
    const name = GLOBAL_NAMES[entry];
    const outputs = [
        {
            file: `dist/${entry}.js`,
            format: 'umd',
            name,
        },
        {
            file: `dist/${entry}.min.js`,
            format: 'umd',
            name,
            plugins: [terser()],
        },
    ];

    if (ESM_ENTRIES.has(entry)) {
        outputs.push(
            {
                file: `dist/${entry}.iife.js`,
                format: 'iife',
                name,
            },
            {
                file: `dist/${entry}.iife.min.js`,
                format: 'iife',
                name,
                plugins: [terser()],
            },
            {
                file: `dist/${entry}.esm.js`,
                format: 'es',
            },
            {
                file: `dist/${entry}.mjs`,
                format: 'es',
            },
        );
    }

    return outputs;
}

export default Object.keys(GLOBAL_NAMES).map(entry => ({
    input: `src/${entry}.ts`,
    output: genOutputs(entry),
    plugins: genPlugins(),
}));
