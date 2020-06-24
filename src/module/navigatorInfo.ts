/**
 * @file NavigatorInfo
 * @author kaivean
 */

import {Module, NavigatorInfoMetric} from '../lib/interface';

export default class NavigatorInfo implements Module {
    // private cb: NavigatorInfoCB;

    getNavigatorInfo() {
        // this.cb = cb;

        let ret: NavigatorInfoMetric = {};
        const dataConnection = navigator.connection;
        if (typeof dataConnection === 'object') {
            ret = {
                downlink: dataConnection.downlink, // 网站下载速度 M/s
                effectiveType: dataConnection.effectiveType, // 网络类型
                rtt: dataConnection.rtt, // 网络往返时间 ms
                saveData: !!dataConnection.saveData, // 数据节约模式
            };
        }

        // 内存 G
        if (navigator.deviceMemory) {
            ret.deviceMemory = navigator.deviceMemory;
        }
        // 核数
        if (navigator.hardwareConcurrency) {
            ret.hardwareConcurrency = navigator.deviceMemory;
        }
        return ret;
    }

    load() {}

    // load() {
    //     let ret: NavigatorInfoMetric = {};
    //     const dataConnection = navigator.connection;
    //     if (typeof dataConnection === 'object') {
    //         ret = {
    //             downlink: dataConnection.downlink, // 网站下载速度 M/s
    //             effectiveType: dataConnection.effectiveType, // 网络类型
    //             rtt: dataConnection.rtt, // 网络往返时间 ms
    //             saveData: !!dataConnection.saveData, // 数据节约模式
    //         };
    //     }

    //     // 内存 G
    //     if (navigator.deviceMemory) {
    //         ret.deviceMemory = navigator.deviceMemory;
    //     }
    //     // 核数
    //     if (navigator.hardwareConcurrency) {
    //         ret.hardwareConcurrency = navigator.deviceMemory;
    //     }

    //     this.cb && this.cb(ret);
    // }
}
