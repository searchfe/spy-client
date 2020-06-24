/**
 * @file Memory
 * @author kaivean
 */

import {Module, MemoryCB} from '../lib/interface';

let initMemory: MemoryInfo | null = null;
if (window.performance && window.performance.memory) {
    initMemory = window.performance.memory;
}

export default class Memory implements Module {
    private cb: MemoryCB;
    private onceLeave = false;
    // constructor() {}

    listenMemory(cb: MemoryCB) {
        this.cb = cb;
    }

    leave() {
        if (!this.onceLeave && initMemory) {
            this.onceLeave = true;

            const curMemory = window.performance.memory as MemoryInfo;
            // fix 早期浏览器的memroy api 值不更新的问题，将此情况排除
            if (curMemory.usedJSHeapSize === initMemory.usedJSHeapSize
                && curMemory.totalJSHeapSize === initMemory.totalJSHeapSize
            ) {
                return;
            }

            const memory = window.performance.memory as MemoryInfo;
            this.cb && this.cb({
                usedJSHeapSize: memory.usedJSHeapSize / 1024,
                totalJSHeapSize: memory.totalJSHeapSize / 1024,
                jsHeapSizeLimit: memory.jsHeapSizeLimit / 1024,
                usedJSHeapRate: 100 * memory.usedJSHeapSize / memory.totalJSHeapSize,
            });
        }
    }
}
