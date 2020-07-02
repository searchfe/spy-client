/**
 * @file 资源、JS、白屏监控的基础
 * @author kaivean
 */

import {
    SpyHeadConf
} from '../lib/spyHeadInterface';

export default {
    conf: {} as SpyHeadConf,
    winerrors: [] as any,
    errorDestroy() {},
    observerDestroy() {},
    entryMap: {} as any,
    init(conf: SpyHeadConf) {},
    send(obj: {type?: 'perf'| 'except' | 'dist' | 'count', group: string, info: any, dim?: any}, logServer?: string) {
        obj.type = obj.type || 'except';
        const conf = this.conf;
        logServer = logServer || conf.logServer;
        let logUrl = `${logServer}?pid=${conf.pid}&lid=${conf.lid}&ts=${Date.now()}`
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
