/**
 * @file eslintrc
 * @author kaivean
 */

// reference to https://github.com/ecomfe/eslint-config
module.exports = {
    extends: [
        '@ecomfe/eslint-config',
        // 注意这些规则会要求使用 ES6 的 import 来引入依赖，
        // 如果使用的是 require 则会出现检查错误，可禁用 import/no-commonjs 和 import/unambiguous 来解决。
        '@ecomfe/eslint-config/import',
        '@ecomfe/eslint-config/typescript'
    ],
    env: {
        'jasmine': true,
        'es6': true,
        'browser': true,
        // 'node': true
    },
    rules: {
        'no-unreachable-loop': 'off',
        'no-console': ['error', {allow: ['warn', 'error']}],
        'import/no-commonjs': 'off',
        'import/unambiguous': 'off',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        // for of 编译出来要多不少代码
        '@typescript-eslint/prefer-for-of': 'off',
        // 还是得写空函数得
        '@typescript-eslint/no-empty-function': 'off',
        // 数组includes方法，在浏览器需要polyfill，少用
        '@typescript-eslint/prefer-includes': 'off',
        // 字符串ends-with ，在浏览器需要polyfill，少用
        '@typescript-eslint/prefer-string-starts-ends-with': 'off',
        '@typescript-eslint/prefer-regexp-exec': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
    }
};
