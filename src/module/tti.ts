import {Module, TTICB, TTIOption} from '../lib/interface';

function filterExcludeLogGifs(entry: PerformanceEntry) {
    return entry.name.indexOf('.gif?') < 0;
}


export default class TTI implements Module {
    private lastLongTask: number = 0;
    private observer: PerformanceObserver | null = null;
    private ttiTimer: any;
    private stopLongTaskTimeoutId: any;
    private cb: TTICB;
    private interval: number = 5000;
    private filterRequest = filterExcludeLogGifs;
    constructor() {
        this.observerCallback = this.observerCallback.bind(this);
        this.ttiCheck = this.ttiCheck.bind(this);
    }

    check() {
        return window.PerformanceObserver && performance && performance.timing && performance.timing.navigationStart;
    }

    listenTTI(cb: TTICB, option?: TTIOption) {
        if (!this.check()) {
            return;
        }
        // 监听获取longtask,持续20s
        this.observeLongtask(20000);

        this.cb = cb;

        option = option || {};
        if (option.interval) {
            this.interval = option.interval;
        }
        if (option.filterRequest) {
            this.filterRequest = option.filterRequest;
        }
    }

    load() {
        if (!this.check()) {
            return;
        }
        // 每 5 秒检查一次是否符合TTI要求
        this.ttiTimer = setInterval(this.ttiCheck, this.interval);
    }

    ttiCheck() {
        if (!this.cb) {
            return;
        }

        const now = performance.now();
        if (now - this.lastLongTask < this.interval) {
            // debug('tti 没有达成条件，上次 longTask 离现在差' + (now - this.lastLongTask) + 'ms');
            return;
        }

        const networkSilence = this.getNetworkSilenceAt();
        if (networkSilence === false) {
            // debug('tti 没有达成条件，网络没有静默');
            return;
        }
        if (now - networkSilence < this.interval) {
            // debug('tti 没有达成条件，上次网络请求离现在差' + (now - networkSilence) + 'ms');
            return;
        }

        // debug('tti 达成条件');

        clearTimeout(this.ttiTimer);

        let tti = this.lastLongTask;
        // 没有longtask，就用dom ready时间作为tti，默认是认为dom ready已经绑定好时间，可以交换了
        if (!tti) {
            tti = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        }

        // 停止 long task 获取
        this.stopObserveLongTask();
        this.cb({
            tti,
        });
    }

    observerCallback(list: PerformanceObserverEntryList) {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        // debug('long task (no more than ' + lastEntry.duration + 'ms) detected');
        // 最新的longTask完成时间
        this.lastLongTask = lastEntry.startTime + lastEntry.duration;
    }

    stopObserveLongTask() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.stopLongTaskTimeoutId) {
            clearTimeout(this.stopLongTaskTimeoutId);
        }
    }

    getNetworkSilenceAt() {
        // const now = performance.now();
        const resources = performance.getEntriesByType('resource')
            .filter(this.filterRequest) as PerformanceResourceTiming[];

        let lastResourceEnd = 0;
        for (const item of resources) {
            // 还没有responseEnd字段，说明网络请求还未结束
            if (!item.responseEnd) {
                return false;
            }
            // 取responseEnd最大值
            if (item.responseEnd > lastResourceEnd) {
                lastResourceEnd = item.responseEnd;
            }
        }

        return lastResourceEnd;
    }

    private observeLongtask(timeout: number) {
        this.stopObserveLongTask();

        try {
            this.observer = new PerformanceObserver(this.observerCallback);
            this.observer.observe({
                entryTypes: ['longtask'],
            });
            this.stopLongTaskTimeoutId = setTimeout(this.stopObserveLongTask, timeout);
        }
        catch (e) {}
    }
}