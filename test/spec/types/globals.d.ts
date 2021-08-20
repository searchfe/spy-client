/**
 * @file 全局声明
 * @author kaivean
 */

interface Window {
    SpyClient: any;
    __spyHead: any;
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

interface PerformanceTiming {
    domFirstPaint?: number;
    domFirstScreenPaint?: number;
}


