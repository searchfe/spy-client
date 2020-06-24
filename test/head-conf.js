window.__spyclientConf = {
    pid: '1_1000',
    lid: 'xx',
    logServer: 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif',

    // 数据类型：异常，触发时间：OnLoadResourceError
    resourceError: {
        group: 'resource',
        sample: 1,
        handler: function (data) {
            data.dim.os = 'ios';
        }
    },
    // 数据类型：异常，触发时间：OnJSError
    jsError: {
        group: 'js',
        sample: 1,
        handler: function (data) {
            data.dim = {os: 'ios'};
        }
    },
    // 数据类型：异常，触发时间：OnJudgeReturnFalseWhenTimeout
    whiteScreenError: {
        sample: 1,
        group: 'whiteScreen',
        selector: 'body',
        subSelector: '#keyelement',
        timeout: 3000,
        handler: function(data) {
            data.dim = {os: 'ios'};
        }
    }
};