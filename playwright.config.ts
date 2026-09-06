import {defineConfig} from '@playwright/test';

/**
 * Playwright e2e 测试配置
 * - 浏览器使用系统安装的 Chrome（channel: 'chrome'），不下载 Playwright 自带的浏览器
 * - 通过 python3 起一个静态服务器，serve 项目根（dist/ 产物 + test/fixtures/）
 */
export default defineConfig({
    testDir: './test/e2e',
    timeout: 30000,
    fullyParallel: false,
    workers: 1,
    reporter: [['list']],
    use: {
        channel: 'chrome',
        baseURL: 'http://localhost:4173',
        // 指标类测试依赖真实渲染，默认有头模式；CI 无显示环境时可改为 headless: true
        headless: false,
    },
    webServer: {
        command: 'python3 -m http.server 4173',
        url: 'http://localhost:4173',
        reuseExistingServer: true,
        timeout: 10000,
    },
});
