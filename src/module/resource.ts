// import Debug from 'debug';
// import { PageApi } from "./pageApi";
// import WebbInstance from 'webb/instance';
// import _ from '@searchfe/underscore';

// const WEBB_PID = '1_1';
// const WEBB_TYPE = 'pf_comm';
// const WEBB_GROUP = 'resource';
// const debug = Debug('perfcollect:resource');

import {Module, ResourceMetric, ResourceCB, ResourceErrorCB, ResType} from '../lib/interface';


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
enum IgnoreImgPath {
    '/mwb2.gif',
};

function getxpath(el: Element | null) {
    if (!el) {
        return {xpath: ''};
    }
    const xpath = [];
    while (el && el.nodeType === 1 && el !== el.parentNode) {
        xpath.push(el.tagName.toLowerCase());

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

export default class Resource implements Module {
    private cb: ResourceCB;
    private bigImgCB: ResourceErrorCB;
    private httpResCB: ResourceErrorCB;
    private maxImgSize: number;

    private readonly jsList: PerformanceResourceTiming[];
    private readonly cssList: PerformanceResourceTiming[];
    private readonly imgList: PerformanceResourceTiming[];
    private readonly fontList: PerformanceResourceTiming[];
    private readonly imgTnList: PerformanceResourceTiming[];

    private readonly bigImgList: PerformanceResourceTiming[];
    private readonly httpResList: PerformanceResourceTiming[];

    constructor() {
        this.jsList = [];
        this.cssList = [];
        this.imgList = [];
        this.fontList = [];

        this.bigImgList = [];
        this.httpResList = [];
    }

    check() {
        return performance && performance.getEntriesByType;
    }

    listenResource(cb: ResourceCB) {
        if (!this.check()) {
            return;
        }
        this.cb = cb;
    }

    listenBigImg(cb: ResourceErrorCB, maxSize = 150) {
        if (!this.check()) {
            return;
        }
        this.maxImgSize = maxSize * 1024;
        this.bigImgCB = cb;
    }

    listenHttpResource(cb: ResourceErrorCB) {
        if (!this.check()) {
            return;
        }

        this.httpResCB = cb;
    }

    load() {
        if (!this.check()) {
            return;
        }

        setTimeout(() => {
            const metric = this.getMetric();
            if (metric) {
                this.cb && this.cb(metric);
            }

            // 发送大图监控数据
            if (window.requestIdleCallback && this.bigImgList.length && this.bigImgCB) {
                window.requestIdleCallback(() => {
                    for (const entry of this.bigImgList) {
                        try {
                            const img = document.body.querySelector('img[src="' + entry.name + '"]');
                            this.bigImgCB({
                                msg: entry.name,
                                xpath: getxpath(img).xpath,
                            });
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                });
            }

            // 发送http资源监控数据
            if (window.requestIdleCallback && this.httpResList.length && this.httpResCB) {
                window.requestIdleCallback(() => {
                    for (const entry of this.httpResList) {
                        try {
                            const img = document.body.querySelector('[src="' + entry.name + '"]');
                            this.httpResCB({
                                msg: entry.name,
                                xpath: getxpath(img).xpath,
                            });
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                });
            }
        }, 500);
    }

    private getUrlObj(url: string): UrlObj {
        try {
            const urlObj: UrlObj = new URL(url);
            const split = urlObj.pathname.split('.');
            urlObj.ext = split[split.length - 1];
            return urlObj;
        }
        catch (error) {
            return ({} as UrlObj);
        }
    }

    private collectHttpResInHttps(timing: PerformanceResourceTiming) {
        if (location.protocol === 'https:' && timing.name.indexOf('http://') === 0) {
            this.httpResList.push(timing);
        }
    }

    // 有些jsonp也属于script，这里只统计js后缀的文件
    private addScript(timing: PerformanceResourceTiming) {
        const {ext} = this.getUrlObj(timing.name);
        if (ext === 'js') {
            if (timing.decodedBodySize !== 0) {
                this.jsList.push(timing);
            }

            this.collectHttpResInHttps(timing);
        }
    }

    // 暂时将css文件或代码块发起的请求归位三类（主要为这两类）
    // 1、加载字体
    // 2、加载背景图（图片不容易区分，有的没有明确后缀名）
    // 3、光标文件（后缀为.cur，这里也划分为图片）
    // （svg当做图片，前述已说明）
    private addCss(timing: PerformanceResourceTiming) {
        const {ext} = this.getUrlObj(timing.name);
        if (ext && FontsTypes.hasOwnProperty(ext)) {
            this.fontList.push(timing);
        }
        else {
            this.imgList.push(timing);
        }
    }

    // link一般加载css资源
    // 也可以通过preload可以预下载一些资源
    // 这里只统计js类型的preload
    private addLink(timing: PerformanceResourceTiming) {
        const {ext} = this.getUrlObj(timing.name);
        if (ext === 'css') {
            this.cssList.push(timing);
        }
        // preload as script
        else if (ext === 'js') {
            this.jsList.push(timing);
        }
    }

    private addImg(timing: PerformanceResourceTiming) {
        const {pathname} = this.getUrlObj(timing.name);
        if (!IgnoreImgPath.hasOwnProperty(pathname)) {
            this.imgList.push(timing);

            // 识别出处理webp的url
            if (timing.name.indexOf('fm=') > -1 && timing.name.indexOf('webpstat=1') > -1) {
                this.imgTnList.push(timing);
            }

            // 大于102400=100K的采集
            if (timing.decodedBodySize > this.maxImgSize) {
                this.bigImgList.push(timing);
            }

            this.collectHttpResInHttps(timing);
        }
    }

    private handleTimings(list: PerformanceEntry[]) {
        const len = list.length;
        for (let i = 0; i < len; i++) {
            switch ((list[i] as any).initiatorType) {
                case 'script':
                    this.addScript(list[i] as PerformanceResourceTiming);
                    break;
                case 'css':
                    this.addCss(list[i] as PerformanceResourceTiming);
                    break;
                case 'img':
                    this.addImg(list[i] as PerformanceResourceTiming);
                    break;
                case 'link':
                    this.addLink(list[i] as PerformanceResourceTiming);
                    break;
                case 'audio':
                    this.collectHttpResInHttps(list[i] as PerformanceResourceTiming);
                    break;
                case 'video':
                    this.collectHttpResInHttps(list[i] as PerformanceResourceTiming);
                    break;
                default:
                    break;
            }
        }
    }

    private getNumAndSize(type: ResType) {
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
        (this as any)[type + 'List'].forEach((timing: PerformanceResourceTiming) => {
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

    private getMetric(): ResourceMetric | undefined {
        // 原来代码
        const {0: mainPageTiming} = performance.getEntriesByType('navigation');
        const resourceTimings = performance.getEntriesByType('resource');

        if (mainPageTiming && resourceTimings && resourceTimings.length) {
            this.handleTimings(resourceTimings);

            let metric: ResourceMetric = {
                ...this.getNumAndSize(ResType.JS),
                ...this.getNumAndSize(ResType.CSS),
                ...this.getNumAndSize(ResType.IMG),
                ...this.getNumAndSize(ResType.FONT),
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

            return metric;
        }
        return;
    }
}