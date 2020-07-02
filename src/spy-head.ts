/**
 * @file SpyClient
 * @author kaivean
 */

import * as error from './head/error';
import * as observer from './head/observer';
import * as whitescreen from './head/whitescreen';
import spyHead from './head/base';

import {
    SpyHeadConf
} from './lib/spyHeadInterface';

spyHead.init = function (conf: SpyHeadConf) {
    if (!conf.logServer) {
        conf.logServer = 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif';
    }
    this.conf = conf;

    error.init(conf);
    observer.init(conf);
    whitescreen.init(conf);
};

// 兼容全局变量定义的初始化方式
if (window.__spyclientConf) {
    spyHead.init(window.__spyclientConf);
}

export default spyHead;