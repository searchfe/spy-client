/**
 * @file 全局声明
 * @author kaivean
 */

interface Window {
    __spyHead: any;
    __spyclientConf: any;
    PerformanceObserver: any;
}

interface Event {
    // MSMediaKeyMessageEvent 继承 Event，并且有message属性 且是 Uint8Array，会有冲突。这里设置为any
    message?: any;
    lineno?: number;
    line?: number;
    colno?: number;
    column?: number;
    error?: any;
    filename: any;
    sourceURL: any;
    errorCharacter?: number;
}

interface Connection {
    downlink?: number;
    effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    onchange?: () => void;
    rtt?: number;
    saveData?: boolean;
}

interface Navigator {
    deviceMemory: number;
    hardwareConcurrency: number;
    connection: Connection;
}

interface MemoryInfo {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
}

interface Performance {
    memory?: MemoryInfo;
}

interface PerformanceTiming {
    domFirstPaint?: number;
    domFirstScreenPaint?: number;
}

// 这些属性在 lib.dom 里分散在 PerformanceElementTiming/PerformanceLayoutShift 等子接口上，
// 而业务里是通过 PerformanceObserver 拿到的基础 PerformanceEntry 来访问，这里统一补充为可选。
// 注意：必须可选，否则会与 PerformanceResourceTiming 等内置子接口冲突（TS2430）。
interface PerformanceEntry {
    loadTime?: number;
    renderTime?: number;
    value?: number;
    hadRecentInput?: boolean;
    attribution?: Array<{containerSrc: string}>;
}
