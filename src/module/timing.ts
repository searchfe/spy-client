/**
 * @file LCP
 * @author kaivean
 */

import {Module, TimingCB, TimingMetric} from '../lib/interface';

export default class Timing implements Module {
    private cb: TimingCB;
    // constructor() {}

    listenTiming(cb: TimingCB) {
        if (!window.performance || !window.performance.timing) {
            // debug('no performance.timing api');
            return;
        }
        this.cb = cb;
    }

    load() {
        setTimeout(() => {
            this.cb && this.cb(this.getMetric());
        }, 500);
    }

    private getMetric(): TimingMetric {
        const metric = {} as TimingMetric;
        const timing: PerformanceTiming = window.performance.timing;

        const startTime = timing.navigationStart;

        // 基础信息
        metric.dns = timing.domainLookupEnd - timing.domainLookupStart;
        metric.tcp = timing.connectEnd - timing.connectStart;
        metric.request = timing.responseStart - timing.requestStart;
        metric.response = timing.responseEnd - timing.responseStart;
        // 这是从页面部分数据返回，浏览器开始解析doc元素到最底部的script脚本解析执行完成
        // 脚本里触发的异步或绑定了更靠后的事件，不再纳入范围内
        metric.parseHtml = timing.domInteractive - timing.domLoading;
        // 很多事件绑定是在domContentLoaded事件里的，所以等其结束，一般页面元素的事件绑定好了，用户可以正确交互
        // 当然存在在该加载事件之后绑定元素事件情况，但不再此考虑范围内
        metric.domReady = timing.domContentLoadedEventEnd - startTime;
        metric.loadEventHandle = timing.loadEventEnd - timing.loadEventStart;
        // 基本该做的都做完，资源也都加载完成了
        // 当然在onload事件处理函数里启动了异步方法，不再纳入范围内
        metric.load = timing.loadEventEnd - startTime;

        // 浏览器首次绘制与首次内容绘制， ios低版本无getEntriesByType api
        if (performance.getEntriesByType) {
            const paintEntries: PerformanceEntry[] = performance.getEntriesByType('paint');
            if (paintEntries && paintEntries.length) {
                paintEntries.forEach(({name, duration, startTime}) => {
                    const time = Math.ceil(duration + startTime);
                    if (name === 'first-paint') {
                        metric.fp = time;
                    }
                    if (name === 'first-contentful-paint') {
                        metric.fcp = time;
                    }
                });
            }
        }

        // 端首次绘制与首屏
        if (timing.domFirstPaint) {
            metric.t7FirstPaint = timing.domFirstPaint - startTime;
        }

        if (timing.domFirstScreenPaint) {
            metric.t7FirstScreen = timing.domFirstScreenPaint - startTime;
        }

        return metric;
    }
}