import {Page} from '@playwright/test';

export const PID = '1_1000';
export const LID = 'xx';

// 1x1 透明 gif，用于 fulfill 被拦截的日志请求
const GIF_BODY = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');

/**
 * 加载 fixture 页面，并等待 window.SpyClient 就绪
 */
export async function gotoFixture(page: Page): Promise<void> {
    await page.goto('/test/fixtures/index.html');
    await page.waitForFunction(() => (window as any).SpyClient !== undefined);
}

/**
 * 拦截发往日志服务器（mwb2.gif）的请求，返回第一个请求的完整 URL。
 * 同时 fulfill 一个空 gif，避免真实外网请求。
 */
export function captureNextLog(page: Page): Promise<string> {
    return new Promise(resolve => {
        page.route('**/mwb2.gif*', route => {
            resolve(route.request().url());
            route.fulfill({status: 200, contentType: 'image/gif', body: GIF_BODY});
        });
    });
}

/**
 * 在浏览器里创建一个 SpyClient 实例，供 page.evaluate 使用
 */
export function spyFactory(option: any = {pid: PID, lid: LID}): string {
    return `(() => {
        const SpyClient = window.SpyClient;
        return new SpyClient(${JSON.stringify(option)});
    })()`;
}
