/**
 * @file 资源、JS、白屏监控的基础
 * @author kaivean
 */

import {
    SpyHeadConf,
} from '../lib/spyHeadInterface';

interface SendObj {
    type?: 'perf'| 'except' | 'dist' | 'count';
    group: string;
    info: any;
    dim?: any;
    lid?: string;
    pid?: string;
    ts?: number;
}

export default {
    conf: {} as SpyHeadConf,
    winerrors: [] as SendObj[],
    errorDestroy() {},
    observerDestroy() {},
    entryMap: {} as any,
    init(conf: SpyHeadConf) {
        this.conf = conf;
    },
    addError(obj: SendObj) {
        // 有些错误一下出现很多次，都聚合都一个错误，加上次数
        if (this.winerrors.length > 0) {
            const lastObj = this.winerrors[this.winerrors.length - 1];
            if (obj.info.msg === lastObj.info.msg) {
                lastObj.info.count += (lastObj.info.count || 0);
                return;
            }
        }
        if (this.winerrors.length < 1000) {
            this.winerrors.push(obj);
        }
    },
    send(obj: SendObj, isSend?: boolean, logServer?: string) {
        const conf = this.conf;
        obj.type = obj.type || 'except';
        obj.pid = conf.pid;
        obj.lid = conf.lid;
        obj.ts = Date.now();

        this.addError(obj);
        this.interceptor && this.interceptor(obj);
        if (isSend === false) {
            return;
        }

        logServer = logServer || conf.logServer;
        let logUrl = `${logServer}?pid=${obj.pid}&lid=${obj.lid}&ts=${obj.ts}`
            + `&type=${obj.type}&group=${obj.group}&info=${encodeURIComponent(JSON.stringify(obj.info))}`;

        if (obj.dim) {
            logUrl += '&dim=' + encodeURIComponent(JSON.stringify(obj.dim));
        }

        let img: (HTMLImageElement | null) = new Image();
        img.src = logUrl;
        img.onload = img.onerror = function () {
            img = null;
        };
    },
};
