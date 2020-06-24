/**
 * @file 白屏监控
 * @author kaivean
 */

import spyclient from './base';

const whiteScreenError = spyclient.conf.whiteScreenError || {};
const handler = whiteScreenError.handler;
const selector = whiteScreenError.selector;
const subSelector = whiteScreenError.subSelector;
const timeout = whiteScreenError.timeout || 6000;
const isSend = Math.random() < (whiteScreenError.sample ? whiteScreenError.sample : 0);

// 补充白屏信息：期间的网络时间
function getNetTime() {
    if (!window.performance) {
        return false;
    }
    const pf = window.performance.timing;
    const netStr = `&dns=${pf.domainLookupEnd - pf.domainLookupStart}`
        + `&tcp=${pf.connectEnd - pf.connectStart}`
        + `&requestTime=${pf.responseStart - pf.requestStart}`
        + `&resoneTime=${pf.responseEnd - pf.responseStart}`;
    return netStr;
}

// 补充白屏信息：期间发生的JS Error 和 资源 Error
function getHisError() {
    if (!(spyclient.winerrors)) {
        return false;
    }
    const errors = spyclient.winerrors;
    const historys = [];
    for (let i = 0; i < errors.length; i++) {
        const stack = (errors[i].stack || '').split('\n')[0];
        historys.push(`(${i })${stack || errors[i].msg}`);
    }
    return historys.join(';;');
}

// 补充白屏信息: 设备信息
function getDeviceInfo() {
    const ret = {} as any;
    // 设备信息
    const dataConnection = navigator.connection || {};
    ret.downlink = dataConnection.downlink; // 网站下载速度 M/s
    ret.effectiveType = dataConnection.effectiveType; // 网络类型
    ret.rtt = dataConnection.rtt; // 网络往返时间 ms
    ret.deviceMemory = navigator.deviceMemory || 0;
    ret.hardwareConcurrency = navigator.hardwareConcurrency || 0;
    return ret;
}

function isWhiteScreen() {
    const ele = document.querySelector(selector);
    if (!ele) {
        return true;
    }
    const sub = ele.querySelector(subSelector);
    if (!sub) {
        return true;
    }
    if (ele.clientHeight < (window.innerHeight * 2 / 3)) {
        return true;
    }
    return false;
}

if (isSend) {
    setTimeout(function () {
        const obj = {
            group: whiteScreenError.group,
            info: {
                msg: '',
                netTime: getNetTime(),
                historyErrors: getHisError(),
                deviceInfo: getDeviceInfo(),
            },
        };

        if (isWhiteScreen()) {
            obj.info.msg = 'WhiteScren Error';

            let allow = true;
            if (handler) {
                allow = handler(obj);
            }

            if (allow !== false && obj.info.msg) {
                spyclient && spyclient.send(obj);
            }
        }
    }, timeout);
}

