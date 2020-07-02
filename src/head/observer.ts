/**
 * @file PerformanceObserver指标采集
 * @author kaivean
 */

import spyHead from './base';
import {
    SpyHeadConf
} from '../lib/spyHeadInterface';

export function init(conf: SpyHeadConf) {
    // Longtask监控
    if (window.PerformanceObserver) {
        const observer = new window.PerformanceObserver(function spyObserveLongtask(list: PerformanceObserverEntryList) {
            const entryMap = spyHead.entryMap;
            const entries = list.getEntries();
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                if (!entryMap[entry.entryType]) {
                    entryMap[entry.entryType] = [];
                }
                entryMap[entry.entryType].push(entry);
            }
        });

        spyHead.observerDestroy = function () {
            observer.disconnect();
        };

        // 在ios下，没有一个类似的监控项是支持的，就抛错，chrome会console warn
        try {
            observer.observe({entryTypes: [
                'longtask',
                'layout-shift',
                'first-input',
                'largest-contentful-paint',
            ]});
        }
        catch (e) {}
    }
}



