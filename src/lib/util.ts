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
    if (URL && url) {
        try {
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
        catch (e) {
            console.error(e);
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


export function getxpath(el: Element | null) {
    if (!el) {
        return {xpath: ''};
    }

    const xpath = [];
    while (el && el.nodeType === 1 && el !== el.parentNode) {
        let t = el.tagName.toLowerCase();
        if (el.getAttribute('id')) {
            t += '[#' + el.getAttribute('id') + ']';
        }
        else if (el.classList && el.classList.length) {
            t += '[.' + el.classList[el.classList.length - 1] + ']';
        }
        xpath.push(t);
        if (el === document.body) {
            break;
        }
        el = el.parentNode as HTMLElement; // 修复缺陷检查
    }
    return {
        xpath: xpath.join('<'),
    };
}