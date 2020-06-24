export interface SpyClientOption {
    /**
     * 模块ID
     */
    pid: string;

    // 日志ID
    /**
     * 日志ID
     */
    lid?: string;

    /**
     * 全局抽样配置，默认是 1，取值从[0, 1]
     */
    sample?: number;

    /**
     * 是否校验发送字段符合规范，默认是 true
     */
    check?: boolean;

    /**
     * 日志服务器，默认是webb服务器，尾部需要加?
     */
    logServer?: string;
}

export class Module {
    // public constructor() {}
    // [propName: string]: listenCallback[],
    // init: () => void;
    load?: () => void;
    leave?: () => void;
    destroy?: () => void;
}

export interface FIDMetric {
    // First Input Delay https://web.dev/fid/
    // 首次输入延迟
    fid: number;
}
export type FIDCB = (metric: FIDMetric) => void;

export interface LCPMetric {
    // Largest Contentful Paint https://web.dev/lcp/
    // 在onload时间内最大块内容绘制完成时间
    lcp: number;
}
export type LCPCB = (metric: LCPMetric) => void;

export enum ResType {
    JS = 'js',
    CSS = 'css',
    IMG = 'img',
    FONT = 'font',
}

export interface ResourceMetric {
    // 页面整体大小：包括主文档、所有JS、CSS、Img、Font，单位KB
    allSize: number;
    // 主文档大小 KB
    docSize: number;
    // 主文档的响应header的大小，包含cookie等 KB
    headerSize: number;

    // js外链的个数
    jsNum: number;
    cssNum: number;
    imgNum: number;
    fontNum: number;

    // 所有JS外链的大小
    jsSize: number;
    cssSize: number;
    imgSize: number;
    fontSize: number;

    // 页面整体网络传输大小，通常来说资源有了缓存，传输大小就为0，另外有Gzip的话，传输大小相比资源本身大小也要小很多
    allTransferSize: number;
    // 主文档网络传输大小
    docTransferSize: number;
    // 所有JS外链的传输大小
    jsTransferSize: number;
    cssTransferSize: number;
    imgTransferSize: number;
    fontTransferSize: number;

    // js cache率
    jsCacheRate: number;
    cssCacheRate: number;
    imgCacheRate: number;
};
export type ResourceCB = (metric: ResourceMetric) => void;


export interface ResourceErrorInfo {
    // 发生异常的资源链接
    msg: string;
    // 发生异常的资源元素的xpath信息，一直到body
    xpath: string;
}
export type ResourceErrorCB = (info: ResourceErrorInfo) => void;


export interface TimingMetric {
    // dns解析
    dns: number;
    // tcp链接
    tcp: number;
    // 主文档请求
    request: number;
    // 主文档响应时间
    response: number;
    // DOM解析时间：Dom解析开始到结束时间
    // 这是从页面部分数据返回，浏览器开始解析doc元素到最底部的script脚本解析执行完成
    // 脚本里触发的异步方法或绑定了更靠后的事件，不再纳入范围内
    parseHtml: number;
    // DOM解析完成总时间：页面开始加载到Dom解析结束
    // 很多事件绑定是在domContentLoaded事件里的，所以等其结束，一般页面元素的事件绑定好了，用户可以正确交互
    // 当然存在在该加载事件之后绑定元素事件情况，但不再此考虑范围内
    domReady: number;
    // 处理所有注册的load事件函数的时间
    loadEventHandle: number;
    // onload完成时间
    // 基本该做的都做完，资源也都加载完成了
    // 当然在onload事件处理函数里启动了异步方法，不再纳入范围内
    load: number;
    // first-paint https://w3c.github.io/paint-timing/#sec-PerformancePaintTiming
    fp?: number;
    // first-contentful-paint  https://w3c.github.io/paint-timing/#sec-PerformancePaintTiming
    fcp?: number;
    // T7内核计算的首次绘制, 单位ms
    t7FirstPaint?: number;
    // T7内核计算的首屏时间, 单位ms
    t7FirstScreen?: number;
}
export type TimingCB = (metric: TimingMetric) => void;


export interface TTIMetric {
    // Time to Interactive https://web.dev/tti/
    // 用户可完全交互时间
    tti: number;
}
export type TTICB = (metric: TTIMetric) => void;

export interface TTIOption {
    // TTI定义里的quiet window，默认是5000 单位ms
    interval?: number;
    // TTI要求在quiet window内，没有任何网络请求，但有一些不会影响页面的请求，比如日志请求，最好过滤掉，避免一直hang在quiet window
    // 默认下，排除掉所有gif请求
    filterRequest?: (entry: PerformanceEntry) => boolean;
}

export interface LayoutShiftMetric {
    // Cumulative Layout Shift定义 https://web.dev/cls/
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内的 Cumulative Layout Shift
    layoutShift: number;
}
export type LayoutShiftCB = (metric: LayoutShiftMetric) => void;


export interface MemoryMetric {
    // 使用内存, 单位KB
    usedJSHeapSize: number;
    // 分配给页面的内存，单位KB
    totalJSHeapSize: number;
    // 内存限制，单位KB
    jsHeapSizeLimit: number;
    // 内存使用率百分比 = 100 * usedJSHeapSize / totalJSHeapSize
    usedJSHeapRate: number;
}
export type MemoryCB = (metric: MemoryMetric) => void;


export interface NavigatorInfoMetric {
    // 网络下载速度 https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/connection
    downlink?: number;
    // 网络类型
    effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    // 估算的往返时间
    rtt?: number;
    // 数据保护模式
    saveData?: boolean;
    // 设备内存 https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
    deviceMemory?: number;
    // 设备逻辑核数  https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency
    hardwareConcurrency?: number;
}
export type NavigatorInfoCB = (metric: NavigatorInfoMetric) => void;


export interface FSPLongtaskMetric {
    // 在T7内核首屏时间内， 每个longtask的时间总和
    fspLongtaskTime: number;
    // 在T7内核首屏时间内，Total Blocking Time时间总和，即Sum(每个longtask的时间 - 50）
    // Total Blocking Time定义：
    fspTBT: number;
    // T7内核首屏时间
    fspTotalTime: number;
    // 在T7内核首屏时间内, Longtask率 = 100 * fspLongtaskTime / fspTotalTime
    fspLongtaskRate: number;
    // 在T7内核首屏时间内的Longtask数量
    fspLongtaskNum: number;
}
export type FSPLongtaskCB = (metric: FSPLongtaskMetric) => void;

export interface LCPLongtaskMetric {
    // 在Largest Contentful Paint时间内， 每个longtask的时间总和
    lcpLongtaskTime: number;
    // 在Largest Contentful Paint时间内，Total Blocking Time时间总和，即Sum(每个longtask的时间 - 50）
    lcpTBT: number;
    // Largest Contentful Paint时间
    lcpTotalTime: number;
    // 在Largest Contentful Paint时间内, Longtask率 = 100 * lcpLongtaskTime / lcpTotalTime
    lcpLongtaskRate: number;
    // 在Largest Contentful Paint时间内的Longtask数量
    lcpLongtaskNum: number;
}
export type LCPLongtaskCB = (metric: LCPLongtaskMetric) => void;


export interface LoadLongtaskMetric {
    // 在onload即页面加载完成时间内， 每个longtask的时间总和
    loadLongtaskTime: number;
    // 在onload即页面加载完成时间内，Total Blocking Time时间总和，即Sum(每个longtask的时间 - 50）
    loadTBT: number;
    // onload即页面加载完成时间
    loadTotalTime: number;
    // 在onload即页面加载完成时间内, Longtask率 = 100 * loadLongtaskTime / loadTotalTime
    loadLongtaskRate: number;
    // 在onload即页面加载完成时间内的Longtask数量
    loadLongtaskNum: number;
}
export type LoadLongtaskCB = (metric: LoadLongtaskMetric) => void;


export interface PageLongtaskMetric {
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内， 每个longtask的时间总和
    pageLongtaskTime: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内，Total Blocking Time时间总和，即Sum(每个longtask的时间 - 50）
    pageTBT: number;
    // 开始加载页面到第一次离开页面(隐藏或点出)时间
    pageTotalTime: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内, Longtask率 = 100 * pageLongtaskTime / pageTotalTime
    pageLongtaskRate: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内的Longtask数量
    pageLongtaskNum: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内，每个来自iframe内的longtask的时间总和
    pageIframeLongtaskTime: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内，每个来自iframe内的Longtask率 = 100 * pageIframeLongtaskTime / pageTotalTime
    pageIframeLongtaskRate: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内，每个来自iframe内的Longtask数量
    pageIframeLongtaskNum: number;
}
export type PageLongtaskCB = (metric: PageLongtaskMetric) => void;
