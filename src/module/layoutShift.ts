/**
 * @file LayoutShift
 * @author kaivean
 */

import {Module, LayoutShiftCB} from '../lib/interface';


const spyclient = (window as any).__spyHead;
const entryType = 'layout-shift';

export default class LayoutShift implements Module {
    private observer: PerformanceObserver | null = null;
    private cb: LayoutShiftCB;
    private value: number;
    private finalValue: number;
    private onceLeave = false;
    constructor() {
        if (!window.PerformanceObserver) {
            return;
        }

        // 先消费之前的
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

    listenLayoutShift(cb: LayoutShiftCB) {
        this.cb = cb;
    }

    leave() {
        if (!this.onceLeave) {
            this.onceLeave = true;
            this.observer && this.observer.takeRecords && this.observer.takeRecords();
            this.finalValue = this.value;
            this.callCB();
            this.destroy();
        }
    }

    callCB() {
        if (this.finalValue !== undefined && this.cb) {
            this.cb({layoutShift: this.finalValue});
        }
    }

    destroy() {
        this.observer && this.observer.disconnect();
        this.observer = null;
    }

    private handle(entries: PerformanceEntryList) {
        entries.map(entry => {
            // hadRecentInput 如果过去500毫秒内有用户输入，则返回 true, 刚进入页面内500ms，不会认为是layoutShift
            if (!entry.hadRecentInput) {
                this.value = (this.value || 0) + (entry.value || 0);
            }
        });
    }
}
