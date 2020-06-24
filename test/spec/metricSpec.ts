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
    //             expect(typeof metric.fid === 'number').toBe(true);
    //             expect(metric.fid > 0).toBe(true);
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
                expect(typeof metric.load === 'number').toBe(true);
                expect(metric.load > 0).toBe(true);
                expect(typeof metric.domReady === 'number').toBe(true);
                expect(metric.domReady > 0).toBe(true);
                expect(typeof metric.parseHtml === 'number').toBe(true);
                expect(metric.parseHtml > 0).toBe(true);
                expect(typeof metric.response === 'number').toBe(true);
                expect(metric.response >= 0).toBe(true);
                expect(typeof metric.request === 'number').toBe(true);
                expect(metric.request >= 0).toBe(true);
                expect(typeof metric.tcp === 'number').toBe(true);
                expect(typeof metric.dns === 'number').toBe(true);

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
                expect(typeof metric.tti === 'number').toBe(true);
                expect(metric.tti > 0).toBe(true);
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
                expect(typeof metric.allSize === 'number').toBe(true);
                expect(metric.allSize > 0).toBe(true);
                expect(typeof metric.allTransferSize === 'number').toBe(true);
                expect(metric.allTransferSize > 0).toBe(true);
                expect(typeof metric.docSize === 'number').toBe(true);
                expect(metric.docSize > 0).toBe(true);
                expect(typeof metric.jsSize === 'number').toBe(true);
                expect(metric.jsSize > 0).toBe(true);
                expect(typeof metric.cssSize === 'number').toBe(true);
                expect(typeof metric.imgSize === 'number').toBe(true);
                expect(typeof metric.headerSize === 'number').toBe(true);

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
                expect(typeof metric.fspLongtaskTime === 'number').toBe(true);
                expect(metric.fspLongtaskTime >= 0).toBe(true);

                expect(typeof metric.fspTBT === 'number').toBe(true);
                expect(metric.fspTBT >= 0).toBe(true);

                expect(typeof metric.fspLongtaskRate === 'number').toBe(true);
                expect(metric.fspLongtaskRate <= 100).toBe(true);
                expect(metric.fspLongtaskRate >= 0).toBe(true);

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
                expect(typeof metric.lcpLongtaskTime === 'number').toBe(true);
                expect(metric.lcpLongtaskTime > 0).toBe(true);

                expect(typeof metric.lcpTBT === 'number').toBe(true);
                expect(metric.lcpTBT > 0).toBe(true);

                expect(typeof metric.lcpLongtaskRate === 'number').toBe(true);
                expect(metric.lcpLongtaskRate <= 100).toBe(true);
                expect(metric.lcpLongtaskRate >= 0).toBe(true);

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
                expect(typeof metric.loadLongtaskTime === 'number').toBe(true);
                expect(metric.loadLongtaskTime > 0).toBe(true);

                expect(typeof metric.loadTBT === 'number').toBe(true);
                expect(metric.loadTBT > 0).toBe(true);

                expect(typeof metric.loadLongtaskRate === 'number').toBe(true);
                expect(metric.loadLongtaskRate <= 100).toBe(true);
                expect(metric.loadLongtaskRate >= 0).toBe(true);

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
                expect(typeof metric.lcp === 'number').toBe(true);
                expect(metric.lcp > 0).toBe(true);

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
                expect(typeof metric.pageLongtaskTime === 'number').toBe(true);
                expect(metric.pageLongtaskTime > 0).toBe(true);

                expect(typeof metric.pageTBT === 'number').toBe(true);
                expect(metric.pageTBT > 0).toBe(true);

                expect(typeof metric.pageLongtaskRate === 'number').toBe(true);
                expect(metric.pageLongtaskRate <= 100).toBe(true);
                expect(metric.pageLongtaskRate >= 0).toBe(true);

                resolve();
            });
        }));

        pros.push(new Promise((resolve, reject) => {
            spy.listenMemory(metric => {
                console.log('listenMemory', metric)
                expect(typeof metric.usedJSHeapSize === 'number').toBe(true);
                expect(metric.usedJSHeapSize > 0).toBe(true);

                expect(typeof metric.usedJSHeapRate === 'number').toBe(true);
                expect(metric.usedJSHeapRate <= 100).toBe(true);
                expect(metric.usedJSHeapRate >= 0).toBe(true);

                resolve();
            });
        }));

        pros.push(new Promise((resolve, reject) => {
            spy.listenLayoutShift(metric => {
                console.log('listenLayoutShift', metric)
                expect(typeof metric.layoutShift === 'number').toBe(true);
                expect(metric.layoutShift >= 0).toBe(true);

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
