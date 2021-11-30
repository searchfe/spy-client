/**
 * @file SpyClient
 * @author kaivean
 */

import {SpyClientOption} from './lib/interface';
import {assign} from './lib/util';

interface Option {
    /**
     * 指标组，它的每个key就是指标名称（英文表示），在平台对应分组添加该指标名称便能实现自动统计
     */
    info: object;

    /**
     * 维度信息对象，它的每个字段就是一个维度名称（英文表示），在平台对应分组添加该维度名称便能实现自动统计
     */
    dim?: object;

    /**
     * 分组，默认：common
     */
    group?: string;

    /**
     * 抽样，会覆盖全局抽样配置，默认是 1，取值从[0, 1]
     */
    sample?: number;

    /**
     * 日志服务器，默认是webb服务器，尾部需要加?
     */
    logServer?: string;
}

interface ErrorInfo {
    /**
     * 错误唯一标识，平台会统计该错误唯一标识的数量
     */
    [propName: string]: any;
}

interface ErrorOption {
    /**
     * 错误信息对象，它必须有msg字段，是错误唯一标识，其他字段可用户随意添加用来补充错误信息
     */
    info?: ErrorInfo;

    /**
     * 维度信息对象，它的每个字段就是一个维度名称（英文表示），在平台对应分组添加该维度名称便能实现自动统计
     */
    dim?: object;

    /**
     * 分组，默认：common
     */
    group?: string;

    /**
     * 抽样，默认是 1，取值从[0, 1]，该抽样会覆盖实例初始化时的抽样配置
     */
    sample?: number;

    /**
     * 业务拓展信息
     */
    ext?: any;
}

const defaultLogServer = 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif?';

const ver = navigator.userAgent.toLowerCase().match(/cpu iphone os (.*?)_/);
const isLtIos14 = ver && ver[2] && (+ver[2] < 14);


function err(msg: string) {
    console.error(`[SpyClient_log]${msg}`);
    // throw new Error(msg);
}

function stringify(obj: any) {
    return Object.keys(obj).map((key: string) => {
        let value = obj[key];

        if (typeof value === 'undefined') {
            value = '';
        }
        else if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }

        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }).join('&');
}

function isArray(arr: any) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

interface SpyClientInnerOption extends SpyClientOption {
    logServer: string;
}

export default class SpyClient {

    sample: any = {};

    markCache: any = {};

    option: SpyClientInnerOption;

    constructor(option: SpyClientOption) {
        if (!option.pid) {
            throw new Error('pid is required');
        }

        this.option = {
            pid: option.pid,
            lid: option.lid,
            check: option.check !== false,
            sample: option.sample,
            localCache: option.localCache,
            logServer: option.logServer || defaultLogServer,
        };
    }

    fetch(url: string, data: any) {
        if (!window.fetch) {
            return;
        }
        fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    sendPost(data: any) {
        let logItems: any[] = isArray(data) ? data : [data];
        const first = logItems[0];
        // 需要在页面暴漏出来pid等基本信息，方式调试查看基本信息与兼容目前的监控
        const query = {
            pid: first.pid,
            type: first.type,
            group: first.group,
        };
        const url = this.option.logServer + stringify(query);

        if (!(
            !isLtIos14
            && navigator.sendBeacon
            && navigator.sendBeacon(url, JSON.stringify(data))
        )) {
            this.fetch(url, data);
        }
    }

    handle(logItem: any) {
        if (!this.check(logItem)) {
            return;
        }

        logItem = assign(
            {
                pid: this.option.pid,
                lid: this.option.lid,
                ts: Date.now(),
                group: 'common',
            },
            logItem
        );

        if (this.option.localCache) {
            this.option.localCache.addLog(logItem);
        }

        // 当前api设置了抽样，
        if (typeof logItem.sample === 'number') {
            if (Math.random() > logItem.sample) {
                return;
            }
        }
        else if (typeof this.option.sample === 'number' && Math.random() > this.option.sample) { // 否则，用全局抽样
            return;
        }

        delete logItem.sample;
        return logItem;
    }

    send(data: any, post = false) {
        let logItems: any[] = isArray(data) ? data : [data];

        let postData = [];
        for (let logItem of logItems) {
            logItem = this.handle(logItem);
            if (!logItem) {
                continue;
            }

            postData.push(logItem);

            // 期望通过post方式上传日志
            if (post) {
                continue;
            }

            const url = this.option.logServer + stringify(logItem);

            // 目前服务器端支持sendBeacon的post请求，可以优先采用，该api可以降低打点丢失率
            // 但是ios有些问题：在webkit浏览内核环境下，beacon requests的请求方式存在证书验证的bug，发送失败但返回正确.
            // 修复说明在如下链接中：https://bugs.webkit.org/show_bug.cgi?id=193508
            // 但是目前为止，在iOS12.2版本中该问题依旧存在
            // 2021-11-11： 发现ios 14可以送，故小于14的不发送
            if (!(
                !isLtIos14
                && navigator.sendBeacon
                && navigator.sendBeacon(url)
            )) {
                (new Image()).src = url;
            }
        }
        if (post) {
            this.sendPost(postData);
        }
    }

    check(query: any): boolean {
        if (!this.option.check) {
            return true;
        }

        const types = ['perf', 'except', 'dist', 'count'];
        if (types.indexOf(query.type) === -1) {
            err('type only is one of ' + types.join(', '));
            return false;
        }

        if (query.group && query.group.length > 30) {
            err('group length execeeds 30');
            return false;
        }

        const simpleReg = /^[a-zA-Z0-9-_]{0,30}$/;

        if (query.type === 'except') {
            if (
                !(typeof query.info.msg === 'string' && query.info.msg.length)
            ) {
                err('info.msg field must be not empty and is String');
                return false;
            }
        }
        else {
            for (const infoKey of Object.keys(query.info)) {
                if (!simpleReg.test(infoKey)) {
                    err(`info.${infoKey} is unexpected. `
                        + 'Length must be not more than 30. '
                        + 'Supported chars: a-zA-Z0-9-_');
                    return false;
                }

                const infoVal = query.info[infoKey];
                if (query.type === 'dist') {
                    if (infoVal.length > 30) {
                        err(`info.${infoKey} value length execeeds 30 when type == 'dist'`);
                        return false;
                    }
                }
                else if (typeof infoVal !== 'number') {
                    err(`info.${infoKey} value must be number`);
                    return false;
                }
            }
        }

        if (query.dim) {
            for (const dimKey of Object.keys(query.dim)) {
                if (!simpleReg.test(dimKey)) {
                    err(`dim key [${dimKey}] is unexpected. `
                        + 'Length must be not more than 30. '
                        + 'Supported chars: a-zA-Z0-9-_');
                    return false;
                }
                const dimVal = query.dim[dimKey];
                if (!/^[a-zA-Z0-9\-_\*\.\s\/#\+@\&\u4e00-\u9fa5]{0,30}$/.test(dimVal)) {
                    err(`dim.${dimKey} value [${dimVal}] is unexpected. `
                        + 'Length must be not more than 30. '
                        + 'Supported chars: a-zA-Z0-9-_*. /#+@& and Chinese');
                    return false;
                }
            }
        }

        return true;
    }

    /**
     *
     * @param option 配置
     */
    sendPerf(option: Option) {
        this.send(assign({
            type: 'perf',
        }, option));
    }

    /**
     *
     * @param option 错误配置项
     */
    sendExcept(option: ErrorOption) {
        this.send(assign({
            type: 'except',
        }, option));
    }

    /**
     *
     * @param option 配置
     */
    sendDist(option: Option) {
        this.send(assign({
            type: 'dist',
        }, option));
    }

    /**
     *
     * @param option 配置
     */
    sendCount(option: Option) {
        this.send(assign({
            type: 'count',
        }, option));
    }

    /**
     *
     * @param e 错误实例
     * @param option 错误配置项
     */
    sendExceptForError(e: Error, option: ErrorOption) {
        const newOpt: ErrorOption = assign({}, option);
        newOpt.info = assign({}, option.info || {}, {
            msg: e.message,
            stack: e.stack,
        });

        this.sendExcept(newOpt);
    }

    startMark(sign: string) {
        this.markCache[sign] = {
            start: Date.now(),
        };
    }

    endMark(sign: string): number {
        if (this.markCache[sign]) {
            this.markCache[sign].total = Date.now() - this.markCache[sign].start;
            return this.markCache[sign].total;
        }
        return 0;
    }

    clearMark(sign: string) {
        if (this.markCache[sign]) {
            delete this.markCache[sign];
        }
    }

    getAllMark() {
        const ret: {[propName: string]: number} = {};
        for (const sign of Object.keys(this.markCache)) {
            ret[sign] = this.markCache[sign].total;
        }
        return ret;
    }

    clearAllMark() {
        this.markCache = {};
    }
}
