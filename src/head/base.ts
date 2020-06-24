/**
 * @file 资源、JS、白屏监控的基础
 * @author kaivean
 */


const conf = window.__spyclientConf || ({} as any);
// 配置
// const defaultConf = {
//     pid: '1_1',
//     lid: '',
//     logServer: 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif',

//     // 数据类型：异常，触发时间：OnLoadResourceError
//     resourceError: {
//         group: 'resource',
//         sample: 0.01,
//         handler: function (data) {

//         }
//     },
//     // 数据类型：异常，触发时间：OnJSError
//     jsError: {
//         group: 'js',
//         sample: 0.01,
//         handler: function (data) {

//         }
//     },
//     // 数据类型：异常，触发时间：OnJudgeReturnFalseWhenTimeout
//     whiteScreenError: {
//         sample: 0.01,
//         group: 'whiteScreen',
//         timeout: 6000,
//         selector: 'body',
//         subSelector: 'button',
//         handler: function(data) {

//         }
//     }
// };

if (!conf.logServer) {
    conf.logServer = 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif';
}

export default {
    conf,
    winerrors: [] as any,
    errorDestroy() {},
    observerDestroy() {},
    entryMap: {} as any,
    send(obj: {type?: 'perf'| 'except' | 'dist' | 'count', group: string, info: any, dim?: any}, logServer?: string) {
        obj.type = obj.type || 'except';
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
