/**
 * @file metric-spec
 * @author kaivean
 */

import SpyClient from '../../dist/spy-client';
import { resolve } from 'dns';
import { rejects } from 'assert';

describe('metric', async () => {
    let spy: SpyClient;

    const img1 = document.createElement('img');
    img1.src = 'https://t7.baidu.com/it/u=1211001202,1148572269&fm=193&app=53&size=w414&n=0&g=0n&f=jpeg?sec=1594890084&t=cde9e5bcd0b06de0c989741a7853bd06';
    document.body.appendChild(img1);

    const button = document.createElement('button');
    button.textContent = 'Please click me';
    document.body.appendChild(button);

    const p = document.createElement('p');
    p.innerHTML = 'TypeScriptJavaScriptJavaScript 的超集用于解决大型项目的代码复杂性一种脚本语言，用于创建动态网页。可以在编译期间发现并纠正错误作为一种解释型语言，只能在运行时发现错误强类型，支持静态和动态类型弱类型，没有静态类型选项最终被编译成 JavaScript 代码，使浏览器可以理解可以直接在浏览器中使用支持模块、泛型和接口不支持模块，泛型或接口支持 ES3，ES4，ES5 和 ES6 等不支持编译其他 ES3，ES4，ES5 或 ES6 功能社区的支持仍在增长，而且还不是很大大量的社区支持以及大量文档和解决问题的支持';
    // document.body.appendChild(p);
    document.body.prepend(p);

    const img3 = document.createElement('img');
    img3.src = 'https://expertimg.cdn.bcebos.com/expertcms/med/zhongyao.jpg';
    document.body.appendChild(img3);

    // 模拟T7内核特有的两个指标
    performance.timing.domFirstPaint = performance.timing.navigationStart + 238;
    performance.timing.domFirstScreenPaint = performance.timing.navigationStart + 400;

    // 模拟Longtaks
    let n = 0;
    for (let i = 0; i < 10000000; i++) {
        n = n + i + i / 3 * 2;
    }

    beforeEach(async () => {
        window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    // chrome可以过，但TRAVIS headless chrome过不了
    if (process.env.TRAVIS) {
        return;
    }

    // 暂时没有找到模拟用户真实点击
    // it('check fid metric', async () => {
    //     await new Promise((resolve, reject) => {
    //         let spy = new SpyClient({
    //             pid: '1_1000',
    //             lid: 'xx',
    //         });

    //         spy.listenFID(metric => {
    //             expect(typeof metric.fid).toBe('number');
    //             expect(metric.fid).toBeGreaterThan(0);
    //         });

    //         (document.querySelector('button') as HTMLButtonElement).click();

    //         setTimeout(() => {
    //             (document.querySelector('button') as HTMLButtonElement).click();
    //         }, 1000);
    //     });
    // });

    it('check timing metric', async () => {
        await new Promise((resolve, reject) => {
            let spy = new SpyClient({
                pid: '1_1000',
                lid: 'xx',
            });
            spy.listenTiming(metric => {
                console.log('listenTiming', metric)
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

                resolve()
            });
        });

    });

    it('check tti metric', async () => {
        await new Promise((resolve, reject) => {
            let spy = new SpyClient({
                pid: '1_1000',
                lid: 'xx',
            });
            spy.listenTTI(metric => {
                expect(typeof metric.tti).toBe('number');
                expect(metric.tti).toBeGreaterThan(0);
                resolve();
            });
        });
    });

    it('check resource metric', async () => {
        await new Promise((resolve, reject) => {
            let spy = new SpyClient({
                pid: '1_1000',
                lid: 'xx',
            });
            spy.listenResource(metric => {
                console.log('listenResource', metric)
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

                resolve()
            });
        });
    });

    it('check big img metric', async () => {
        await new Promise((resolve, reject) => {
            let spy = new SpyClient({
                pid: '1_1000',
                lid: 'xx',
            });
            spy.listenBigImg(metric => {
                console.log('listenBigImg', metric)
                expect(metric.msg === 'https://expertimg.cdn.bcebos.com/expertcms/med/zhongyao.jpg').toBe(true);
                expect(metric.xpath.includes('<')).toBe(true);

                resolve();
            });
        });
    });


    it('check FSPLongTask metric', async () => {
        await new Promise((resolve, reject) => {
            let spy = new SpyClient({
                pid: '1_1000',
                lid: 'xx',
            });
            spy.listenFSPLongTask(metric => {
                console.log('listenFSPLongTask', metric)
                expect(typeof metric.fspLongtaskTime).toBe('number');
                expect(metric.fspLongtaskTime).toBeGreaterThanOrEqual(0);

                expect(typeof metric.fspTBT).toBe('number');
                expect(metric.fspTBT).toBeGreaterThanOrEqual(0);

                expect(typeof metric.fspLongtaskRate).toBe('number');
                expect(metric.fspLongtaskRate).toBeLessThanOrEqual(100);
                expect(metric.fspLongtaskRate).toBeGreaterThanOrEqual(0);

                resolve();
            });
        });
    });

    it('check LCPLongTask metric', async () => {
        await new Promise((resolve, reject) => {
            let spy = new SpyClient({
                pid: '1_1000',
                lid: 'xx',
            });
            spy.listenLCPLongTask(metric => {
                expect(typeof metric.lcpLongtaskTime).toBe('number');
                expect(metric.lcpLongtaskTime).toBeGreaterThan(0);

                expect(typeof metric.lcpTBT).toBe('number');
                expect(metric.lcpTBT).toBeGreaterThan(0);

                expect(typeof metric.lcpLongtaskRate).toBe('number');
                expect(metric.lcpLongtaskRate).toBeLessThanOrEqual(100);
                expect(metric.lcpLongtaskRate).toBeGreaterThanOrEqual(0);

                resolve();
            });
        });
    });

    it('check LoadLongTask metric', async () => {
        await new Promise((resolve, reject) => {
            let spy = new SpyClient({
                pid: '1_1000',
                lid: 'xx',
            });
            spy.listenLoadLongTask(metric => {
                expect(typeof metric.loadLongtaskTime).toBe('number');
                expect(metric.loadLongtaskTime).toBeGreaterThan(0);

                expect(typeof metric.loadTBT).toBe('number');
                expect(metric.loadTBT).toBeGreaterThan(0);

                expect(typeof metric.loadLongtaskRate).toBe('number');
                expect(metric.loadLongtaskRate).toBeLessThanOrEqual(100);
                expect(metric.loadLongtaskRate).toBeGreaterThanOrEqual(0);

                resolve();
            });
        });
    });


    it('check lcp metric', async () => {
        await new Promise((resolve, reject) => {
            let spy = new SpyClient({
                pid: '1_1000',
                lid: 'xx',
            });
            spy.listenLCP(metric => {
                console.log('listenLCP', metric)
                expect(typeof metric.lcp).toBe('number');
                expect(metric.lcp).toBeGreaterThan(0);

                resolve();
            });
        });
    });

    it('check leave metric', async () => {
        let spy = new SpyClient({
            pid: '1_1000',
            lid: 'xx',
        });
        let pros: any[] = [];

        pros.push(new Promise((resolve, reject) => {
            spy.listenPageLongTask(metric => {
                console.log('listenPageLongTask', metric)
                expect(typeof metric.pageLongtaskTime).toBe('number');
                expect(metric.pageLongtaskTime).toBeGreaterThan(0);

                expect(typeof metric.pageTBT).toBe('number');
                expect(metric.pageTBT).toBeGreaterThan(0);

                expect(typeof metric.pageLongtaskRate).toBe('number');
                expect(metric.pageLongtaskRate).toBeLessThanOrEqual(100);
                expect(metric.pageLongtaskRate).toBeGreaterThanOrEqual(0);

                resolve();
            });
        }));

        pros.push(new Promise((resolve, reject) => {
            spy.listenMemory(metric => {
                console.log('listenMemory', metric)
                expect(typeof metric.usedJSHeapSize).toBe('number');
                expect(metric.usedJSHeapSize).toBeGreaterThan(0);

                expect(typeof metric.usedJSHeapRate).toBe('number');
                expect(metric.usedJSHeapRate).toBeLessThanOrEqual(100);
                expect(metric.usedJSHeapRate).toBeGreaterThanOrEqual(0);

                resolve();
            });
        }));

        pros.push(new Promise((resolve, reject) => {
            spy.listenLayoutShift(metric => {
                console.log('listenLayoutShift', metric)
                expect(typeof metric.layoutShift).toBe('number');
                expect(metric.layoutShift).toBeGreaterThanOrEqual(0);

                resolve();
            });
        }));

        // 产生layout shift
        const img2 = document.createElement('img');
        img2.src = 'https://t7.baidu.com/it/u=3748430357,3395801118&fm=193&app=53&size=w414&n=0&g=0n&f=jpeg?sec=1594890084&t=4004954b76645ad405242a68e6f77599';
        document.body.prepend(img2);

        setTimeout(() => {
            // 模拟页面隐藏事件，测试 page longtask 和 memory
            Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
            Object.defineProperty(document, 'hidden', {value: true, writable: true});
            document.dispatchEvent(new Event("visibilitychange"));
        }, 100);

        await Promise.all(pros);

    });
});
