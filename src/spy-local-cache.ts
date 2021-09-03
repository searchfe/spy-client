import {huffmanEncode, huffmanDecode} from './lib/huffman';

class Storage {
    static isSupport: () => boolean;

    set(key: string, value: any) {

    }

    get(key: string, cb: any) {

    }

    rm(key: string) {

    }
}

class LS extends Storage {
    static isSupport() {
        return !!window.localStorage;
    }

    set(key: string, value: any) {
        try {
            localStorage.setItem(key, value);
        }
        catch (e) {
            console.error(e);
        }
        return;
    }

    get(key: string, cb: any) {
        let res = null;
        try {
            res = localStorage.getItem(key);
        }
        catch (e) {
            console.error(e);
        }
        if (cb) {
            cb(res);
        }
        return;
    }

    rm(key: string) {
        try {
            localStorage.removeItem(key);
        }
        catch (e) {
            console.error(e);
        }
        return;
    }

}

class IndexedDB extends Storage {
    static isSupport() {
        return !!window.indexedDB;
    }

    set(key: string, value: any) {

    }

    get(key: string, cb: any) {

    }
}

function assign(...args: any[]) {
    const __assign = Object.assign || function __assign(t: any) {
        for (let s, i = 1, n = arguments.length; i < n; i++) {
            // eslint-disable-next-line prefer-rest-params
            s = arguments[i];
            for (const p in s) {
                if (Object.prototype.hasOwnProperty.call(s, p)) {
                    t[p] = s[p];
                }
            }
        }
        return t;
    };
    return __assign.apply(this, args);
};

function utf8Encode(text: string) {
    let result = '';
    for (let n = 0; n < text.length; n++) {
        const c = text.charCodeAt(n);
        if (c < 128) {
            result += String.fromCharCode(c);
        }
        else if (c > 127 && c < 2048) {
            result += String.fromCharCode((c >> 6) | 192);
            result += String.fromCharCode((c & 63) | 128);
        }
        else {
            result += String.fromCharCode((c >> 12) | 224);
            result += String.fromCharCode(((c >> 6) & 63) | 128);
            result += String.fromCharCode((c & 63) | 128);
        }
    }
    return result;
    // return window.btoa(result);
}

function utf8Decode(text: string) {
    // text = window.atob(text);
    let result = '';
    let i = 0;
    let c1 = 0;
    let c2 = 0;
    let c3 = 0;
    while (i < text.length) {
        c1 = text.charCodeAt(i);
        if (c1 < 128) {
            result += String.fromCharCode(c1);
            i++;
        }
        else if (c1 > 191 && c1 < 224) {
            c2 = text.charCodeAt(i + 1);
            result += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = text.charCodeAt(i + 1);
            c3 = text.charCodeAt(i + 2);
            result += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return result;
}


function lzw(text: string, deCompress = false) {
    if (!text) {
        return '';
    };
    if (!deCompress) {
        text = utf8Encode(text);
    }

    let dict: any = {};
    let out: any[] = [];
    let prefix = text.charAt(0);
    let curChar = prefix;
    let oldPrefix = curChar;
    let idx = 256;
    let i;
    let c;
    let d;
    let g = function () {
        out.push(prefix.length > 1 ? String.fromCharCode(dict[prefix]) : prefix);
    };
    if (deCompress) {
        out.push(prefix);
    }
    for (i = 1, c, d; i < text.length; i++) {
        c = text.charAt(i);
        if (deCompress) {
            d = text.charCodeAt(i);
            prefix = d < 256 ? c : dict[d] || (prefix + curChar);
            out.push(prefix);
            curChar = prefix.charAt(0);
            dict[idx++] = oldPrefix + curChar;
            oldPrefix = prefix;
        }
        else {
            if (dict.hasOwnProperty(prefix + c)) {
                prefix += c;
            }
            else {
                g();
                dict[prefix + c] = idx++;
                prefix = c;
            }
        }
    }
    if (!deCompress) {
        g();
    }

    let ret = out.join('');
    if (deCompress) {
        ret = utf8Decode(ret);
    }

    return ret;
}


export default class SpyLocalCache {
    private option: any;
    private storage: Storage;
    private timer: ReturnType<typeof setTimeout>;
    private tmpList: string[] = [];
    constructor(option: any = {}) {
        this.option = assign({
            defaultTrigger: true,
            compress: 'lzw', // huffman lzw no
            key: 'SpyLocalCache',
            interval: 500,
            onFlush: () => {},
            storage: LS.isSupport()
                    ? 'localstorage'
                    : 'empty',
        }, option);

        this.load = this.load.bind(this);

        this.init();
    }

    init() {
        if (this.option.storage === 'indexedDB') {
            this.storage = new IndexedDB();
        }
        else if (this.option.storage === 'localstorage') {
            this.storage = new LS();
        }
        else {
            this.storage = new Storage();
        }

        if (document.readyState === 'complete') {
            this.load();
        }
        else {
            window.addEventListener('load', this.load);
        }
    }

    load() {
        if (location.search.indexOf('_FlushLogLocalCache=1') > -1 && this.option.defaultTrigger) {
            this.flushLog();
        }
    }

    addLog(info: any) {
        info = JSON.stringify(info);

        this.tmpList.push(info as string);

        // 控制写日志频率
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            this.save();
        }, this.option.interval);
    }

    getData(cb: any) {
        try {
            this.storage.get(this.option.key, (encodeStr: string) => {
                if (encodeStr) {
                    this.storage.get(this.option.key + 'Codes', (codes: any) => {
                        let res: any[] = [];
                        try {
                            if (codes) {
                                codes = JSON.parse(codes);
                            }
                            const str = this.unzip(encodeStr, codes);
                            res = str.split('\n');
                        }
                        catch (e) {
                            console.error(e);
                        }
                        cb(res);
                    });
                }
                else {
                    cb([]);
                }
            });

        }
        catch (e) {
            console.error(e);
            cb([]);
        }
    }

    save() {
        this.getData((list: any[]) => {
            let content = list.concat(this.tmpList).join('\n');
            let startT = Date.now();
            let data = this.zip(content);
            let cost = Date.now() - startT;
            let codesStr = '';
            if (data.codes) {
                codesStr = JSON.stringify(data.codes);
                this.storage.set(this.option.key + 'Codes', codesStr);
            }
            else {
                this.storage.rm(this.option.key + 'Codes');
            }
            this.storage.set(this.option.key, data.result);

            let before = content.length;
            let after = codesStr.length + data.result.length;
            console.log(content, content.length);
            console.log(codesStr + data.result, (codesStr + data.result).length);
            console.log('压缩率', (before - after) * 100 / before, '%');
            console.log('耗时:', cost);
            this.tmpList = [];
        });
    }

    flushLog() {
        this.getData((list: any[]) => {

            // 先解析来自存储的数据，若失败，说明格式有问题，清空存储
            try {
                for (let index = 0; index < list.length; index++) {
                    list[index] = JSON.parse(list[index]);
                }
            }
            catch (e) {
                list = [];
                this.storage.rm(this.option.key);
                console.error(e);
            }
            // 未落盘的数据也加上
            for (let index = 0; index < this.tmpList.length; index++) {
                list.push(JSON.parse(this.tmpList[index]));
            }
            this.option.onFlush && this.option.onFlush(list);
        });
    }

    zip(str: string) {
        if (this.option.compress === 'lzw') {
            return {
                codes: null,
                result: lzw(str),
            };
        }
        else if (this.option.compress === 'huffman') {
            return huffmanEncode(str);
        }
        return {
            codes: null,
            result: str,
        };
    }

    unzip(str: string, codes?: any) {
        if (this.option.compress === 'lzw') {
            return lzw(str, true);
        }
        else if (this.option.compress === 'huffman') {
            return huffmanDecode(codes, str);
        }
        return str;
    }
}

// For test
// let content = JSON.stringify({
//     type: 3,
//     fm: 'disp',
//     data: [{"base":{"size":{"doc":{"w":360,"h":4875},"wind":{"w":360,"h":640},"scr":{"w":360,"h":640}},"vsb":"visible","num":16},"t":1629773746698,"path":"/s"}],
//     qid: 10991431029479106376,
//     did: '8dd09c47c7bc90c9fd7274f0ad2c581e',
//     q: '刘德华',
//     t: 1629773746698,
// });
// const compressText = lzw(content);
// const deCompressText = lzw(compressText, true);
// console.log('compressText', compressText, compressText.length);
// console.log('deCompressText', deCompressText, deCompressText.length);
