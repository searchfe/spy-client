import {huffmanEncode, huffmanDecode} from './lib/huffman';

class Storage {
    static isSupport: () => boolean;

    set(key: string, value: any) {

    };

    get(key: string, cb: any) {

    };
}

class LS extends Storage {
    static isSupport() {
        return !!window.indexedDB;
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

type FlushCb = (strs: string[]) => void;

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

class SpyLocalCache {
    private option: any;
    private storage: Storage;
    private timer: ReturnType<typeof setTimeout>;
    private tmpList: string[] = [];
    constructor(option: any = {}) {
        this.option = assign({
            defaultTrigger: true,
            compress: 'base64',
            key: 'logLocalCache',
            interval: 500,
            onFlush: (list: any[]) => {},
            storage: IndexedDB.isSupport()
                ? 'indexDB'
                : LS.isSupport()
                    ? 'localstorage'
                    : 'empty'
        }, option);

        this.load = this.load.bind(this);
    }

    init() {
        if (document.readyState === 'complete') {
            this.load();
        }
        else {
            window.addEventListener('load', this.load);
        }

        if (this.option.storage === 'indexDB') {
            this.storage = new IndexedDB();
        }
        else if (this.option.storage === 'localstorage') {
            this.storage = new LS();
        }
        else {
            this.storage = new Storage();
        }
    }

    load() {
        if (location.search.indexOf('_FlushLogLocalCache=1')) {
            this.flushLog((list) => {
                this.option.onFlush && this.option.onFlush(list);
            });
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
        this.storage.get(this.option.key, (encodeStr: string) => {
            if (encodeStr) {
                this.storage.get(this.option.key + 'Codes', (codes: any) => {
                    if (codes) {
                        codes = JSON.parse(codes);
                    }
                    const str = this.unzip(encodeStr, codes);

                    cb(str.split('\n'));
                });
            }
            else {
                cb([]);
            }
        });
    }

    save() {
        this.getData((list: any[]) => {
            list = list.concat(this.tmpList);
            let data = this.zip(list.join('\n'));

            data.codes && this.storage.set(this.option.key, data.codes);
            this.storage.set(this.option.key, data.result);

            this.tmpList = [];
        });
    }

    flushLog(cb: FlushCb) {
        this.getData((list: any[]) => {
            list = list.concat(this.tmpList);
            for (let index = 0; index < list.length; index++) {
                list[index] = JSON.parse(list[index]);
            }
            cb(list);
        });
    }

    zip(str: string) {
        if (this.option.compress === 'base64') {
            if (window.btoa) {
                return {
                    codes: null,
                    result: window.btoa(str),
                };
            }
        }
        else if (this.option.compress === 'huffman') {
            return huffmanEncode(str);
        }
        return {
            codes: null,
            result: str
        };
    }

    unzip(str: string, codes?: any) {
        if (this.option.compress === 'base64') {
            if (window.atob) {
                return window.atob(str);
            }
        }
        else if (this.option.compress === 'huffman') {
            return huffmanDecode(codes, str);
        }
        return str;
    }
}


let content = 'i like like like java do you like a java';
const res = huffmanEncode(content);
console.log('压缩后的字符串长度', res.result.length);
console.log('压缩后的字符串', res.result);


console.log('解压后的字符串', huffmanDecode(res.codes, res.result), '其长度:', huffmanDecode(res.codes, res.result).length);