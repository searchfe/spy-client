
import {
    Module, ResourceMetric, ResourceCB, ResourceErrorCB, ResType,
    ResOption,
    BigImgOption,
    HttpResOption,
    SlowOption,
    ResourceHostMetric
} from '../lib/interface';
import {getUrlInfo, URLINFO, assign, getResTiming} from '../lib/util';


// URL拓展
// 增加后缀名
interface UrlObj extends URL {
    ext?: string;
};


// 字体
// svg使用场景比较灵活，可能作为一种字体格式，也可能当做图片使用
// 但因woff在所有现代浏览器中都支持，在css中使用iconfont时
// 往往优先加载woff格式字体文件，所以这里将svg划分为图片一类
enum FontsTypes {
    ttf,
    eot,
    woff,
    woff2
};


// 忽略图片
// 下述图片路径往往是用来进行日志统计，不是正常图片
const ignoreDefaultPaths = [
    '/mwb2.gif',
];

function ignorePath(url: string, paths: string[]) {
    for (const path of paths) {
        if (url.indexOf(path) > -1) {
            return true;
        }
    }
    return false;
}

function getxpath(el: Element | null) {
    if (!el) {
        return {xpath: ''};
    }
    const xpath = [];
    while (el && el.nodeType === 1 && el !== el.parentNode) {
        let t = el.tagName.toLowerCase();
        if (el.classList && el.classList.length && el.classList[0]) {
            t += '[.' + el.classList[0] + ']';
        }
        xpath.push(t);

        if (el === document.body) {
            break;
        }
        el = el.parentNode as Element; // 修复缺陷检查
    }
    return {
        xpath: xpath.join('<'),
    };
}

function f(n: number): number {
    return +n.toFixed(1);
}

interface ListItem {
    timing: PerformanceResourceTiming;
    type: string;
}

interface ListWithHost {
    [host: string]: ListItem[];
}

export default class Resource implements Module {
    private cb: ResourceCB;
    private bigImgCB: ResourceErrorCB;
    private httpResCB: ResourceErrorCB;
    private slowResCB: ResourceErrorCB;
    private resOption: ResOption;
    private bigImgOption: BigImgOption;
    private httpResOption: HttpResOption;
    private slowOption: SlowOption;
    private trigger: string = 'load';

    private readonly jsList: PerformanceResourceTiming[];
    private readonly cssList: PerformanceResourceTiming[];
    private readonly imgList: PerformanceResourceTiming[];
    private readonly fontList: PerformanceResourceTiming[];

    private readonly hostList: ListWithHost;
    private readonly bigImgList: ListWithHost;
    private readonly httpResList: ListWithHost;
    private readonly slowList: ListWithHost;

    constructor() {
        this.jsList = [];
        this.cssList = [];
        this.imgList = [];
        this.fontList = [];

        this.hostList = {};
        this.bigImgList = {};
        this.httpResList = {};
        this.slowList = {};

        this.resOption = {ignorePaths: [], trigger: 'load'};
        this.bigImgOption = {ignorePaths: [], maxSize: 150 * 1024, trigger: 'load'};
        this.httpResOption = {ignorePaths: [], trigger: 'load'};
        this.slowOption = {ignorePaths: [], trigger: 'load', threshold: 1000};
    }

    check() {
        return performance && performance.getEntriesByType;
    }

    listenResource(cb: ResourceCB, option: ResOption = {}) {
        if (!this.check()) {
            return;
        }
        this.resOption = assign(this.resOption, option);
        this.trigger = this.resOption.trigger as string;
        this.cb = cb;
    }

    listenBigImg(cb: ResourceErrorCB, option: BigImgOption = {}) {
        if (!this.check()) {
            return;
        }
        this.bigImgOption = assign(this.bigImgOption, option);
        this.trigger = this.bigImgOption.trigger as string;
        this.bigImgCB = cb;
    }

    listenHttpResource(cb: ResourceErrorCB, option: HttpResOption = {}) {
        if (!this.check()) {
            return;
        }
        this.httpResOption = assign(this.httpResOption, option);
        this.trigger = this.httpResOption.trigger as string;
        this.httpResCB = cb;
    }

    listenSlowResource(cb: ResourceErrorCB, option: SlowOption = {}) {
        if (!this.check()) {
            return;
        }
        this.slowOption = assign(this.slowOption, option);
        this.trigger = this.slowOption.trigger as string;
        this.slowResCB = cb;
    }

    report() {
        const metricRes = this.getMetric();
        if (metricRes) {
            const {metric, hostMetric} = metricRes;
            this.cb && this.cb(metric, hostMetric);
        }

        if (this.bigImgCB) {
            // 发送大图监控数据
            if (window.requestIdleCallback && Object.keys(this.bigImgList).length && this.bigImgCB) {
                window.requestIdleCallback(() => {
                    for (const host of Object.keys(this.bigImgList)) {
                        for (const entry of this.bigImgList[host]) {
                            const timing = entry.timing;
                            const type = entry.type;
                            try {
                                const img = document.body.querySelector('img[src="' + timing.name + '"]');
                                this.bigImgCB({
                                    msg: timing.name,
                                    dur: timing.duration,
                                    xpath: getxpath(img).xpath,
                                    host,
                                    type,
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
            }
        }

        if (this.httpResCB) {
            // 发送http资源监控数据
            if (window.requestIdleCallback && Object.keys(this.httpResList).length && this.httpResCB) {
                window.requestIdleCallback(() => {
                    for (const host of Object.keys(this.httpResList)) {
                        for (const entry of this.httpResList[host]) {
                            const timing = entry.timing;
                            const type = entry.type;
                            try {
                                const img = document.body.querySelector('[src="' + timing.name + '"]');
                                this.httpResCB({
                                    msg: timing.name,
                                    dur: timing.duration,
                                    xpath: getxpath(img).xpath,
                                    host,
                                    type,
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
            }
        }

        if (this.slowResCB) {
            // 发送慢资源监控数据
            if (window.requestIdleCallback && Object.keys(this.slowList).length && this.httpResCB) {
                window.requestIdleCallback(() => {
                    for (const host of Object.keys(this.slowList)) {
                        for (const entry of this.slowList[host]) {
                            const timing = entry.timing;
                            const type = entry.type;
                            try {
                                const img = document.body.querySelector('[src="' + timing.name + '"]');

                                const info = getResTiming(timing);

                                this.slowResCB({
                                    ...info,
                                    dur: timing.duration,
                                    msg: timing.name,
                                    xpath: getxpath(img).xpath,
                                    host,
                                    type,
                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                });
            }
        }
    }

    load() {
        if (this.trigger !== 'load') {
            return;
        }
        if (!this.check()) {
            return;
        }

        setTimeout(() => {
            this.report();
        }, 500);
    }

    leave() {
        if (this.trigger !== 'leave') {
            return;
        }
        this.report();
    }

    private push(type: string, list: any, timing: PerformanceResourceTiming, urlInfo: URLINFO) {
        if (!ignorePath(urlInfo.pathname, this.resOption.ignorePaths || [])) {
            list.push(timing);
            this.pushWithHost(type, this.hostList, timing, urlInfo);
        }

        if (!ignorePath(urlInfo.pathname, this.slowOption.ignorePaths || [])) {
            if (timing.duration > (this.slowOption.threshold as number)) {
                this.pushWithHost(type, this.slowList, timing, urlInfo);
            }
        }

    }

    private pushWithHost(type: string, list: any, timing: PerformanceResourceTiming, urlInfo: URLINFO) {
        const host = urlInfo.host;
        if (!list[host]) {
            list[host] = [] as ListItem[];
        }
        list[host].push({
            timing,
            type,
        });
    }

    private collectHttpResInHttps(type: string, timing: PerformanceResourceTiming, urlInfo: URLINFO) {
        if (location.protocol === 'https:'
            && timing.name.indexOf('http://') === 0
            && !ignorePath(urlInfo.pathname, this.httpResOption.ignorePaths || [])
        ) {
            this.pushWithHost(type, this.httpResList, timing, urlInfo);
        }
    }

    // 有些jsonp也属于script，这里只统计js后缀的文件
    private addScript(timing: PerformanceResourceTiming, urlInfo: URLINFO) {
        if (urlInfo.ext === 'js') {
            if (timing.decodedBodySize !== 0) {
                this.push('js', this.jsList, timing, urlInfo);
            }
        }
    }

    // 暂时将css文件或代码块发起的请求归位三类（主要为这两类）
    // 1、加载字体
    // 2、加载背景图（图片不容易区分，有的没有明确后缀名）
    // 3、光标文件（后缀为.cur，这里也划分为图片）
    // （svg当做图片，前述已说明）
    private addResFromCss(timing: PerformanceResourceTiming, urlInfo: URLINFO) {
        if (urlInfo.ext && FontsTypes.hasOwnProperty(urlInfo.ext)) {
            this.push('font', this.fontList, timing, urlInfo);
        }
        else {
            this.addImg(timing, urlInfo);
        }
    }

    // link一般加载css资源
    // 也可以通过preload可以预下载一些资源
    // 这里只统计js类型的preload
    private addLink(timing: PerformanceResourceTiming, urlInfo: URLINFO) {
        if (urlInfo.ext === 'css') {
            this.push('css', this.cssList, timing, urlInfo);
        }
        // preload as script
        else if (urlInfo.ext === 'js') {
            this.push('js', this.jsList, timing, urlInfo);
        }
    }

    private addImg(timing: PerformanceResourceTiming, urlInfo: URLINFO) {
        this.push('img', this.imgList, timing, urlInfo);

        // 大于指定size的图片采集
        if (
            timing.decodedBodySize > (this.bigImgOption.maxSize || 0)
            && !ignorePath(urlInfo.pathname, this.bigImgOption.ignorePaths || [])
        ) {
            this.pushWithHost('img', this.bigImgList, timing, urlInfo);
        }
    }

    private handleTimings(list: PerformanceEntry[]) {
        const len = list.length;
        for (let i = 0; i < len; i++) {
            const timing = list[i] as PerformanceResourceTiming;
            const urlInfo = getUrlInfo(timing.name);

            if (ignorePath(urlInfo.pathname, ignoreDefaultPaths)) {
                continue;
            }
            switch ((list[i] as any).initiatorType) {
                case 'script':
                    this.addScript(timing, urlInfo);
                    break;
                case 'css':
                    this.addResFromCss(timing, urlInfo);
                    break;
                case 'img':
                    this.addImg(timing, urlInfo);
                    break;
                case 'link':
                    this.addLink(timing, urlInfo);
                    break;
                case 'audio':
                    this.collectHttpResInHttps('audio', timing, urlInfo);
                    break;
                case 'video':
                    this.collectHttpResInHttps('video', timing, urlInfo);
                    break;
                default:
                    break;
            }
        }
    }

    private getNumAndSize(type: string, list: PerformanceResourceTiming[]) {
        const obj: any = {};
        const num = type + 'Num';
        const size = type + 'Size';
        const transferSize = type + 'TransferSize';
        const cacheRate = type + 'CacheRate';
        const duration = type + 'Duration';
        obj[num] = 0;
        obj[size] = 0;
        obj[transferSize] = 0;
        let totalDurationTime = 0;
        list.forEach((timing: PerformanceResourceTiming) => {
            obj[num]++;
            obj[size] += (timing.decodedBodySize / 1024);
            obj[transferSize] += (timing.transferSize / 1024);
            totalDurationTime += timing.duration;
        });
        obj[duration] = f(obj[num] > 0 ? totalDurationTime / obj[num] : 0);

        if (obj[size]) {
            const diff = obj[size] - obj[transferSize];
            obj[cacheRate] = f(diff >= 0 ? 100 * diff / obj[size] : 0);
        }

        obj[size] = f(obj[size]);
        obj[transferSize] = f(obj[transferSize]);

        return obj;
    }

    private getMetric(): {metric: ResourceMetric, hostMetric: ResourceHostMetric} | undefined {
        // 原来代码
        const {0: mainPageTiming} = performance.getEntriesByType('navigation');
        const resourceTimings = performance.getEntriesByType('resource');

        if (mainPageTiming && resourceTimings && resourceTimings.length) {
            this.handleTimings(resourceTimings);

            let metric: ResourceMetric = {
                ...this.getNumAndSize(ResType.JS, this.jsList),
                ...this.getNumAndSize(ResType.CSS, this.cssList),
                ...this.getNumAndSize(ResType.IMG, this.imgList),
                ...this.getNumAndSize(ResType.FONT, this.fontList),
            };

            // 主文档大小
            const pageTiming = mainPageTiming as PerformanceResourceTiming;
            metric.docSize = f(pageTiming.decodedBodySize / 1024);
            metric.docTransferSize = f(pageTiming.transferSize / 1024);

            metric.headerSize = f((pageTiming.transferSize - pageTiming.encodedBodySize || 0) / 1024);

            metric.allSize = f(metric.docSize
                + metric.jsSize
                + metric.cssSize
                + metric.imgSize
                + metric.fontSize);

            metric.allTransferSize = f(metric.docTransferSize
                + metric.jsTransferSize
                + metric.cssTransferSize
                + metric.imgTransferSize
                + metric.fontTransferSize);

            const hostMetric: ResourceHostMetric = {};
            for (const host of Object.keys(this.hostList)) {
                const timings = this.hostList[host].map(item => item.timing);
                hostMetric[host] = this.getNumAndSize('host', timings);
            }

            return {metric, hostMetric};
        }
        return;
    }
}