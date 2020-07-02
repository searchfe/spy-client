export interface ErrorHandlerData {
    info: {
        [propName: string]: any;
        msg: string;
    };
    group: string;
    dim?: {
        [propName: string]: any;
    };
}

export interface ErrorConf {
    // 抽样， 取值在[0, 1]，为0，则相当于禁用，默认是0
    sample: number;
    // 自定义spy平台的分组
    group: string;
    // 异常数据上报前的自定义处理，可以修改data对象，增加信息和维度，如果返回false，则表示不上报该数据
    handler: (data: ErrorHandlerData) => boolean | undefined;
}

export interface WhiteScreenErrorConf extends ErrorConf {
    // 超时时间，在到达超时时间后，执行检测，如果条件不成立，则认为会抛出白屏错误
    timeout: number;
    // css选择器
    selector: string;
    // css选择器
    subSelector: string;
}

export interface SpyHeadConf {
    // spy平台申请的pid
    pid: string;
    // 可选，用户log id
    lid?: string;
    // 可选，自定义日志服务器
    logServer?: string;
    jsError: ErrorConf;
    resourceError: ErrorConf;
    whiteScreenError: WhiteScreenErrorConf;
}