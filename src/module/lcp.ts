/**
 * @file LCP
 * @author kaivean
 */

import {Module, LCPCB} from '../lib/interface';
import {setData} from '../lib/data';

const spyclient = (window as any).__spyHead;
const entryType = 'largest-contentful-paint';

export default class LCP implements Module {
    private observer: PerformanceObserver | null = null;
    private value: number;
    private finalValue: number;
    private cb: LCPCB;
    constructor() {
        if (!window.PerformanceObserver) {
            return;
        }
        if (spyclient && spyclient.entryMap && spyclient.entryMap[entryType]) {
            this.handle(spyclient.entryMap[entryType]);
        }
        try {
            // 仅在 img,image,svg,video,css url, block element with text nodes
            this.observer = new PerformanceObserver(list => {
                this.handle(list.getEntries());
            });
            this.observer.observe({entryTypes: [entryType]});
        }
        catch (e) {}
    }

    listenLCP(cb: LCPCB) {
        this.cb = cb;
        this.callCB();
    }

    callCB() {
        if (this.finalValue && this.cb) {
            this.cb({lcp: this.finalValue});
        }
    }

    load() {
        this.observer && this.observer.takeRecords && this.observer.takeRecords();
        this.finalValue = this.value;
        setData('lcp', this.value);
        this.callCB();
        this.destroy();
    }

    destroy() {
        this.observer && this.observer.disconnect();
        this.observer = null;
    }

    private handle(entries: PerformanceEntryList) {
        entries.map(entry => {
            this.value = entry.renderTime || entry.loadTime;
        });
    }
}
