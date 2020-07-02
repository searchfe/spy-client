/**
 * @file 全局声明
 * @author kaivean
 */

interface Window {
    __spyHead: any;
    __spyclientConf: any;
    PerformanceObserver: any;
    requestIdleCallback: (callback: Function, options?: any) => void;
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

type PerformanceObserverType =
  | 'first-input'
  | 'largest-contentful-paint'
  | 'layout-shift'
  | 'longtask'
  | 'measure'
  | 'navigation'
  | 'paint'
  | 'resource';


type PerformanceEntryInitiatorType =
  | 'beacon'
  | 'css'
  | 'fetch'
  | 'img'
  | 'other'
  | 'script'
  | 'xmlhttprequest';


interface PerformanceEntry {
    decodedBodySize?: number;
    // duration: number;
    // entryType: PerformanceObserverType;
    initiatorType?: PerformanceEntryInitiatorType;
    loadTime: number;
    // name: string;
    renderTime: number;
    // startTime: number;
    // hadRecentInput?: boolean;
    value?: number;
    hadRecentInput: boolean;
    attribution: Array<{containerSrc: string}>;
}

interface PerformanceObserver {
    takeRecords: () => PerformanceEntryList;
}
