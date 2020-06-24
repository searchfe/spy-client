/**
 * @file 资源和JS错误监控
 * @author kaivean
 */


import spyclient from './base';

const resourceError = spyclient.conf.resourceError || {};
const jsError = spyclient.conf.jsError || {};
const isSendJserror = Math.random() < (jsError.sample ? jsError.sample : 0);
const isSendResource =  Math.random() < (resourceError.sample ? resourceError.sample : 0);

const winerrors = spyclient.winerrors;

function getxpath(el: HTMLElement) {
    const xpath = [];
    while (el && el.nodeType === 1 && el !== el.parentNode) {
        xpath.push(el.tagName.toLowerCase());
        if (el === document.body) {
            break;
        }
        el = el.parentNode as HTMLElement; // 修复缺陷检查
    }
    return {
        xpath: xpath.join('<'),
    };
}

function spyListenError(event: Event) {
    try {
        const el = event.target;
        const obj = {info: {} as any, dim: {} as any, group: ''};
        const info = obj.info;
        const srcElement = event.srcElement as (HTMLElement | Window);

        // 设备信息
        const dataConnection = navigator.connection || {};
        info.downlink = dataConnection.downlink; // 网站下载速度 M/s
        info.effectiveType = dataConnection.effectiveType; // 网络类型
        info.rtt = dataConnection.rtt; // 网络往返时间 ms
        info.deviceMemory = navigator.deviceMemory || 0;
        info.hardwareConcurrency = navigator.hardwareConcurrency || 0;

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
                    info.msg = 'MODULE_TIMEOUT for miss:' + (matches[2] as string);
                }
            }

            // 历史错误
            const historys = [];
            for (let index = 0; index < spyclient.winerrors.length; index++) {
                const item = spyclient.winerrors[index];
                const prefix = item.count > 1 ? `(${item.count})` : '';
                historys.push(prefix + (item.msg as string));

            }

            info.hisErrors = historys.join('----');

            let allow = true;
            if (jsError.handler) {
                allow = jsError.handler(obj);
            }

            if (allow !== false && isSendJserror) {
                spyclient.send(obj);
            }
        }
        else {
            obj.group = resourceError.group;
            obj.dim.type = (srcElement as HTMLElement).tagName.toLowerCase();
            const url = (srcElement as HTMLScriptElement).src || (srcElement as HTMLLinkElement).href;
            info.msg = url || 'unknown load eror';

            if (el && (el as HTMLElement).tagName === 'IMG') {
                info.xpath = getxpath(el as HTMLElement).xpath;
            }

            let allow = true;
            if (resourceError.handler) {
                allow = resourceError.handler(obj);
            }

            if (allow !== false && isSendResource) {
                spyclient.send(obj);
            }
        }

        // 有些错误一下出现很多次，都聚合都一个错误，加上次数
        if (winerrors.length > 0) {
            const lastInfo = winerrors[winerrors.length - 1];
            if (info.msg === lastInfo.msg) {
                lastInfo.count += (lastInfo.count || 0);
                return;
            }
        }
        winerrors.push(info);
    }
    catch (e) {
        console.error(e);
    }
}
window.addEventListener('error', spyListenError, true);
spyclient.errorDestroy = function () {
    window.removeEventListener('error', spyListenError, true);
    spyclient.winerrors = null;
};
