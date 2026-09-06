import {test, expect} from '@playwright/test';
import {gotoFixture, captureNextLog, PID, LID} from './helpers';

const LOG_SERVER = 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif';

test.beforeEach(async ({page}) => {
    await gotoFixture(page);
});

test('check whiteScreen', async ({page}) => {
    const urlPromise = captureNextLog(page);
    await page.evaluate(({pid, lid, logServer}) => {
        window.__spyHead.init({
            pid,
            lid,
            logServer,
            whiteScreenError: {
                sample: 1,
                group: 'whiteScreen',
                selector: 'body',
                subSelector: '#keyelement',
                timeout: 1000,
                handler: function (data: any) {
                    data.dim = {os: 'ios'};
                },
            },
        });
    }, {pid: PID, lid: LID, logServer: LOG_SERVER});

    const url = new URL(await urlPromise);
    const info = JSON.parse(url.searchParams.get('info') || '{}');
    const dim = JSON.parse(url.searchParams.get('dim') || '{}');
    expect(dim.os).toBe('ios');
    expect(info.msg).toBe('WhiteScren Error');
});

test('check resourceError', async ({page}) => {
    const failUrl = 'https://mss0.bdstatic.com/se/static/js/iphone/zbios/zbiosT_f69.js';
    // 拦截 404 脚本请求，返回 404 触发 onerror
    await page.route('**/zbiosT_f69.js', route => route.fulfill({status: 404, body: ''}));

    const urlPromise = captureNextLog(page);
    await page.evaluate(({pid, lid, logServer, url}) => {
        window.__spyHead.init({
            pid,
            lid,
            logServer,
            resourceError: {
                group: 'resource',
                sample: 1,
                handler: function (data: any) {
                    data.dim.os = 'ios';
                },
            },
        });
        const script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);
    }, {pid: PID, lid: LID, logServer: LOG_SERVER, url: failUrl});

    const url = new URL(await urlPromise);
    const info = JSON.parse(url.searchParams.get('info') || '{}');
    const dim = JSON.parse(url.searchParams.get('dim') || '{}');
    expect(dim.os).toBe('ios');
    expect(info.msg).toBe(failUrl);
});
