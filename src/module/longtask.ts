/**
 * @file Longtask
 * @author kaivean
 */


import {Module, FSPLongtaskCB, LCPLongtaskCB, LoadLongtaskCB, PageLongtaskCB} from '../lib/interface';
import {getData} from '../lib/data';

export interface LongtaskData {
    longtaskTime?: number;
    longtaskRate?: number;
    longtaskNum?: number;
    totalTime?: number;
    longtaskIframeTime?: number;
    longtaskIframeNum?: number;
    longtaskIframeRate?: number;
    iframeLongtasks?: {[propName: string]: number[] | undefined};
}

const spyclient = window.__spyclient;
const entryType = 'longtask';

export default class Longtask implements Module {
    private lts: PerformanceEntryList = [];
    private observer: PerformanceObserver | null = null;
    private fspCB: FSPLongtaskCB;
    private lcpCB: LCPLongtaskCB;
    private loadCB: LoadLongtaskCB;
    private pageCB: PageLongtaskCB;
    private onceLeave = false;
    constructor() {
        if (spyclient && spyclient.entryMap && spyclient.entryMap[entryType]) {
            this.lts = this.lts.concat(spyclient.entryMap[entryType]);
        }
        try {
            this.observer = new PerformanceObserver(list => {
                this.lts = this.lts.concat(list.getEntries());
            });
            // buffered 兼容性太差
            this.observer.observe({entryTypes: [entryType]});
        }
        catch (e) {}
    }

    check() {
        return window.PerformanceObserver && performance && performance.timing && performance.timing.navigationStart;
    }

    listenFSPLongTask(cb: FSPLongtaskCB) {
        if (!this.check()) {
            return;
        }
        this.fspCB = cb;
    }

    listenLCPLongTask(cb: LCPLongtaskCB) {
        if (!this.check()) {
            return;
        }
        this.lcpCB = cb;
    }

    listenLoadLongTask(cb: LoadLongtaskCB) {
        if (!this.check()) {
            return;
        }
        this.loadCB = cb;
    }

    listenPageLongTask(cb: PageLongtaskCB) {
        if (!this.check()) {
            return;
        }
        this.pageCB = cb;
    }
    load() {
        if (!this.check()) {
            return;
        }

        const data = this.getStatData(Date.now());

        // lcp的值存入data模块也是在load期间，这里延迟一会再获取
        setTimeout(() => {
            this.loadCB && this.loadCB({
                loadLongtaskTime: data.time,
                loadTBT: data.tbt,
                loadTotalTime: data.totalTime,
                loadLongtaskRate: data.rate,
                loadLongtaskNum: data.num,
            });

            if (performance.timing && performance.timing.domFirstScreenPaint) {
                const data = this.getStatData(performance.timing.domFirstScreenPaint);
                this.fspCB && this.fspCB({
                    fspLongtaskTime: data.time,
                    fspTBT: data.tbt,
                    fspTotalTime: data.totalTime,
                    fspLongtaskRate: data.rate,
                    fspLongtaskNum: data.num,
                });
            }

            if (getData('lcp')) {
                const data = this.getStatData(performance.timing.navigationStart + (getData('lcp') as number));
                this.lcpCB && this.lcpCB({
                    lcpLongtaskTime: data.time,
                    lcpTBT: data.tbt,
                    lcpTotalTime: data.totalTime,
                    lcpLongtaskRate: data.rate,
                    lcpLongtaskNum: data.num,
                });
            }
        }, 200);
    }

    leave() {
        if (!this.onceLeave) {
            this.onceLeave = true;

            const data = this.getStatData(Date.now());
            this.pageCB && this.pageCB({
                pageLongtaskTime: data.time,
                pageTBT: data.tbt,
                pageTotalTime: data.totalTime,
                pageLongtaskRate: data.rate,
                pageLongtaskNum: data.num,
                pageIframeLongtaskTime: data.iframeTime,
                pageIframeLongtaskRate: data.iframeRate,
                pageIframeLongtaskNum: data.iframeNum,
            });
        }
    }


    destroy() {
        this.lts = [];
        this.observer && this.observer.disconnect();
        this.observer = null;
    }

    getStatData(finalTime: number) {
        const navigationStart = performance.timing.navigationStart;
        let time = 0;
        // Total Blocking Time
        let tbt = 0;
        let num = 0;
        let iframeTime = 0;
        let iframeNum = 0;
        let iframeLongtasks = {} as any;

        for (let index = 0; index < this.lts.length; index++) {
            const item = this.lts[index];
            const duration = item.duration;
            const end = navigationStart + item.startTime + duration;

            if (end < finalTime) {
                time += duration;
                // 多出来的时间
                tbt += (duration - 50 > 0 ? duration - 50 : 0);
                num++;

                if (item.attribution && item.attribution[0]) {
                    const containerSrc = item.attribution[0].containerSrc;
                    if (containerSrc && containerSrc !== location.href) {
                        if (!iframeLongtasks[containerSrc]) {
                            iframeLongtasks[containerSrc] = [];
                        }
                        iframeLongtasks[containerSrc].push(duration);

                        iframeTime += duration;
                        iframeNum++;
                    }
                }
            }
        }

        const totalTime = finalTime - navigationStart;

        return {
            num,
            time,
            tbt,
            totalTime: totalTime,
            rate: 100 * time / totalTime,
            iframeTime,
            iframeNum,
            iframeRate: 100 * iframeTime / totalTime,
            iframeLongtasks,
        };
    }
}
