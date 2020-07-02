/**
 * @file FID
 * @author kaivean
 */

import {Module, FIDCB} from '../lib/interface';

const spyclient = (window as any).__spyHead;
const entryType = 'first-input';

export default class FID implements Module {
    private observer: PerformanceObserver | null = null;
    private cb: FIDCB;
    private finalValue: number;
    constructor() {
        if (!window.PerformanceObserver) {
            return;
        }

        if (spyclient && spyclient.entryMap && spyclient.entryMap[entryType]) {
            this.handle(spyclient.entryMap[entryType]);
        }
        try {
            this.observer = new PerformanceObserver(list => {
                this.handle(list.getEntries());
            });
            this.observer.observe({entryTypes: [entryType]});
        }
        catch (e) {}
    }

    listenFID(cb: FIDCB) {
        this.cb = cb;
        this.callCB();
    }

    callCB() {
        if (this.finalValue !== undefined && this.cb) {
            this.cb({fid: this.finalValue});
        }
    }

    destroy() {
        this.observer && this.observer.disconnect();
        this.observer = null;
    }

    private handle(entries: PerformanceEntryList) {
        const lastEntry = entries.pop();
        if (lastEntry) {
            this.finalValue = lastEntry.duration;
            this.callCB();
            this.destroy();
        }
    }
}
