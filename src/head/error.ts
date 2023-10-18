/**
 * @file 资源和JS错误监控
 * @author kaivean
 */

import {
    ErrorHandlerData,
    SpyHeadConf,
    ErrorConf,
} from '../lib/spyHeadInterface';
import {getUrlInfo, getxpath} from '../lib/util';

import spyHead from './base';

export function init(conf: SpyHeadConf) {
    const resourceError = conf.resourceError || {} as ErrorConf;
    const jsError = conf.jsError || {} as ErrorConf;
    const isSendJserror = Math.random() < (jsError.sample ? jsError.sample : 0);
    const isSendResource =  Math.random() < (resourceError.sample ? resourceError.sample : 0);

    const winerrors = spyHead.winerrors;
    let resourceErrorCount = 0;

    function spyListenError(event: Event) {
        try {
            const el = event.target;
            const obj = {info: {}, dim: {}, group: ''} as ErrorHandlerData;
            const info = obj.info;
            const srcElement = event.srcElement as (HTMLElement | Window);

            // 设备信息
            const dataConnection = navigator.connection || {};
            info.downlink = dataConnection.downlink; // 网站下载速度 M/s
            info.effectiveType = dataConnection.effectiveType; // 网络类型
            info.rtt = dataConnection.rtt; // 网络往返时间 ms
            info.deviceMemory = navigator.deviceMemory || 0;
            info.hardwareConcurrency = navigator.hardwareConcurrency || 0;

            // JS错误
            if (srcElement === window) {
                obj.group = jsError.group;

                // 异常信息
                const error = event.error || {};
                info.msg = event.message;
                info.file = event.filename;
                info.ln = event.lineno;
                info.col = event.colno;
                info.stack = (error.stack || '').split('\n').slice(0, 3).join('\n');

                // 针对esl的MODULE_TIMEOUT处理
                if (info.msg.indexOf('MODULE_TIMEOUT') !== -1) {
                    const matches = info.msg.match(/^.*Hang:(.*); Miss:(.*)/);
                    if (matches && matches[2]) {
                        info.msg = 'MODULE_TIMEOUT for miss:' + (matches[2]);
                    }
                }

                // 历史错误
                const historys = [];
                for (let index = 0; index < winerrors.length; index++) {
                    const item = winerrors[index];
                    const prefix = item.info.count > 1 ? `(${item.info.count})` : '';
                    historys.push(prefix + (item.info.msg as string));
                }

                info.hisErrors = historys.join('----');

                let allow: boolean | undefined | void = true;
                if (jsError.handler) {
                    allow = jsError.handler(obj);
                }

                if (allow !== false) {
                    spyHead.send(obj, isSendJserror);
                }
            }
            // 资源错误
            else {
                obj.group = resourceError.group;
                (obj.dim as any).type = (srcElement as HTMLElement).tagName.toLowerCase();

                const url = (srcElement as HTMLScriptElement).src || (srcElement as HTMLLinkElement).href || '';
                // 日志本身失败，要忽略
                if (url.indexOf('/mwb2.gif?') > -1) {
                    return;
                }

                info.msg = url || 'unknown load eror';

                (obj.dim as any).host = getUrlInfo(url).host;

                if (el && (el as HTMLElement).tagName === 'IMG') {
                    info.xpath = getxpath(el as HTMLElement).xpath;
                }

                if (resourceErrorCount) {
                    info.hisErrCount = resourceErrorCount;
                }

                let allow: boolean | undefined | void = true;
                if (resourceError.handler) {
                    allow = resourceError.handler(obj);
                }

                if (allow !== false) {
                    spyHead.send(obj, isSendResource);
                }

                resourceErrorCount++;
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    window.addEventListener('error', spyListenError, true);
    spyHead.errorDestroy = function () {
        window.removeEventListener('error', spyListenError, true);
        spyHead.winerrors = [];
    };
}

