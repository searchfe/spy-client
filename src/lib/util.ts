/**
 * @file utils
 * @author kaivean
 */

export function assign(...args: any[]) {
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

export interface URLINFO {
    protocol: string;
    host: string;
    pathname: string;
    ext: string;
};

function getUrlInfoFromURL(url: string): URLINFO | undefined {
    if (URL) {
        const obj = new URL(url);
        if (obj.host !== undefined) {
            return {
                protocol: obj.protocol,
                host: obj.host,
                pathname: obj.pathname,
                ext: '',
            };
        }
    }
    return;
}

export function getUrlInfo(url: string): URLINFO {
    let info = getUrlInfoFromURL(url);

    if (!info) {
        const parser = document.createElement('a');
        parser.href = url;
        info = {
            protocol: parser.protocol,
            host: parser.host || location.host,
            pathname: parser.pathname,
            ext: '',
        };
    }

    const split = info.pathname.split('.');
    info.ext = split[split.length - 1];
    return info;
}

function f(n: number): number {
    return +n.toFixed(1);
}

export function getResTiming(t: PerformanceTiming | PerformanceResourceTiming) {
    return {
        wait: f(t.domainLookupStart - ((t as any).navigationStart || t.fetchStart || (t as any).startTime)),
        dns: f(t.domainLookupEnd - t.domainLookupStart),
        connect: f(t.connectEnd - t.connectStart),
        req: f(t.responseStart - t.requestStart),
        res: f(t.responseEnd - t.responseStart),
    };
}