import {test, expect, Page} from '@playwright/test';
import {gotoFixture} from './helpers';

const PID = '1_1000';
const LID = 'xx';
const LOG_SERVER = 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif';

/**
 * 统一的浏览器内采集流程：
 * 1. init spy-head —— 让其 PerformanceObserver 观察 longtask/lcp/layout-shift 并记录到 entryMap
 * 2. 模拟 T7 指标、动态插入大图（触发 LCP 候选 / layout shift / resource）
 * 3. 可选制造同步长任务
 * 4. 等待 observer 回调落盘，再创建 SpyClient（此时各模块能从 entryMap 读到历史）
 * 5. listen 对应指标并 resolve 回调结果
 */
function collect(page: Page, method: string, withLongtask = false): Promise<any> {
    return page.evaluate(({method, withLongtask}) => new Promise(resolve => {
        window.__spyHead.init({pid: '1_1000', lid: 'xx', logServer: 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif'});

        (performance.timing as any).domFirstPaint = performance.timing.navigationStart + 238;
        (performance.timing as any).domFirstScreenPaint = performance.timing.navigationStart + 400;

        // 长任务需在独立宏任务里制造，PerformanceObserver 才能识别为 longtask
        setTimeout(() => {
            if (withLongtask) {
                const start = performance.now();
                while (performance.now() - start < 200) {
                    /* busy wait */
                }
            }
            // 长任务之后插入固有尺寸大的图片，触发 LCP 更新（LCP 值晚于长任务）
            const img = document.createElement('img');
            img.src = location.origin + '/test/fixtures/big.png';
            img.width = 1000;
            img.height = 1000;
            document.body.prepend(img);

            setTimeout(() => {
                const SpyClient = (window as any).SpyClient;
                const spy = new SpyClient({pid: '1_1000', lid: 'xx'});
                if (method === 'listenBigImg') {
                    spy.listenBigImg((m: any) => resolve(m), {maxSize: 1, ignorePaths: [], trigger: 'load'});
                }
                else {
                    (spy as any)[method]((m: any) => resolve(m));
                }
            }, 1000);
        }, 0);
    }), {method, withLongtask});
}

test.beforeEach(async ({page}) => {
    await gotoFixture(page);
});

test('check timing metric', async ({page}) => {
    const metric = await collect(page, 'listenTiming');
    expect(typeof metric.load).toBe('number');
    expect(metric.load).toBeGreaterThan(0);
    expect(typeof metric.domReady).toBe('number');
    expect(metric.domReady).toBeGreaterThan(0);
    expect(typeof metric.parseHtml).toBe('number');
    expect(metric.parseHtml).toBeGreaterThan(0);
    expect(typeof metric.response).toBe('number');
    expect(metric.response).toBeGreaterThanOrEqual(0);
    expect(typeof metric.request).toBe('number');
    expect(metric.request).toBeGreaterThanOrEqual(0);
    expect(typeof metric.tcp).toBe('number');
    expect(typeof metric.dns).toBe('number');
});

test('check tti metric', async ({page}) => {
    const metric = await collect(page, 'listenTTI');
    expect(typeof metric.tti).toBe('number');
    expect(metric.tti).toBeGreaterThan(0);
});

test('check resource metric', async ({page}) => {
    const metric = await collect(page, 'listenResource');
    expect(typeof metric.allSize).toBe('number');
    expect(metric.allSize).toBeGreaterThan(0);
    expect(typeof metric.allTransferSize).toBe('number');
    expect(metric.allTransferSize).toBeGreaterThan(0);
    expect(typeof metric.docSize).toBe('number');
    expect(metric.docSize).toBeGreaterThan(0);
    expect(typeof metric.jsSize).toBe('number');
    expect(metric.jsSize).toBeGreaterThan(0);
    expect(typeof metric.cssSize).toBe('number');
    expect(typeof metric.imgSize).toBe('number');
    expect(typeof metric.headerSize).toBe('number');
});

test('check big img metric', async ({page}) => {
    const metric = await collect(page, 'listenBigImg');
    expect(metric.msg).toContain('big.png');
    expect(metric.xpath.includes('<')).toBe(true);
});

test('check FSPLongTask metric', async ({page}) => {
    const metric = await collect(page, 'listenFSPLongTask', true);
    expect(typeof metric.fspLongtaskTime).toBe('number');
    expect(metric.fspLongtaskTime).toBeGreaterThanOrEqual(0);
    expect(typeof metric.fspTBT).toBe('number');
    expect(metric.fspTBT).toBeGreaterThanOrEqual(0);
    expect(typeof metric.fspLongtaskRate).toBe('number');
    expect(metric.fspLongtaskRate).toBeLessThanOrEqual(100);
    expect(metric.fspLongtaskRate).toBeGreaterThanOrEqual(0);
});

test('check LCPLongTask metric', async ({page}) => {
    const metric = await collect(page, 'listenLCPLongTask', true);
    expect(typeof metric.lcpLongtaskTime).toBe('number');
    expect(metric.lcpLongtaskTime).toBeGreaterThan(0);
    expect(typeof metric.lcpTBT).toBe('number');
    expect(metric.lcpTBT).toBeGreaterThan(0);
    expect(typeof metric.lcpLongtaskRate).toBe('number');
    expect(metric.lcpLongtaskRate).toBeLessThanOrEqual(100);
    expect(metric.lcpLongtaskRate).toBeGreaterThanOrEqual(0);
});

test('check LoadLongTask metric', async ({page}) => {
    const metric = await collect(page, 'listenLoadLongTask', true);
    expect(typeof metric.loadLongtaskTime).toBe('number');
    expect(metric.loadLongtaskTime).toBeGreaterThan(0);
    expect(typeof metric.loadTBT).toBe('number');
    expect(metric.loadTBT).toBeGreaterThan(0);
    expect(typeof metric.loadLongtaskRate).toBe('number');
    expect(metric.loadLongtaskRate).toBeLessThanOrEqual(100);
    expect(metric.loadLongtaskRate).toBeGreaterThanOrEqual(0);
});

test('check lcp metric', async ({page}) => {
    const metric = await collect(page, 'listenLCP');
    expect(typeof metric.lcp).toBe('number');
    expect(metric.lcp).toBeGreaterThan(0);
});

test('check leave metric', async ({page}) => {
    const [pageLongtask, memory, layoutShift] = await page.evaluate(() => new Promise(resolve => {
        window.__spyHead.init({pid: '1_1000', lid: 'xx', logServer: 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif'});

        // 布局偏移
        const img = document.createElement('img');
        img.src = location.origin + '/test/fixtures/small.png';
        img.width = 2000;
        img.height = 2000;
        document.body.prepend(img);

        setTimeout(() => {
            // 长任务（独立宏任务，供 longtask 观察）
            const start = performance.now();
            while (performance.now() - start < 200) {
                /* busy wait */
            }

            setTimeout(() => {
                const SpyClient = (window as any).SpyClient;
                const spy = new SpyClient({pid: '1_1000', lid: 'xx'});

                const p1 = new Promise(r => spy.listenPageLongTask((m: any) => r(m)));
                const p2 = new Promise(r => spy.listenMemory((m: any) => r(m)));
                const p3 = new Promise(r => spy.listenLayoutShift((m: any) => r(m)));

                // 模拟页面隐藏，触发 leave
                setTimeout(() => {
                    Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
                    Object.defineProperty(document, 'hidden', {value: true, writable: true});
                    document.dispatchEvent(new Event('visibilitychange'));
                }, 100);

                Promise.all([p1, p2, p3]).then((r: any[]) => resolve(r));
            }, 500);
        }, 0);
    }));

    expect(typeof pageLongtask.pageLongtaskTime).toBe('number');
    expect(pageLongtask.pageLongtaskTime).toBeGreaterThan(0);
    expect(typeof pageLongtask.pageTBT).toBe('number');
    expect(pageLongtask.pageTBT).toBeGreaterThan(0);
    expect(typeof pageLongtask.pageLongtaskRate).toBe('number');
    expect(pageLongtask.pageLongtaskRate).toBeLessThanOrEqual(100);
    expect(pageLongtask.pageLongtaskRate).toBeGreaterThanOrEqual(0);

    expect(typeof memory.usedJSHeapSize).toBe('number');
    expect(memory.usedJSHeapSize).toBeGreaterThan(0);
    expect(typeof memory.usedJSHeapRate).toBe('number');
    expect(memory.usedJSHeapRate).toBeLessThanOrEqual(100);
    expect(memory.usedJSHeapRate).toBeGreaterThanOrEqual(0);

    expect(typeof layoutShift.layoutShift).toBe('number');
    expect(layoutShift.layoutShift).toBeGreaterThanOrEqual(0);
});
