/**
 * @file head-spec
 * @author kaivean
 */

// import SpyClient from 'spy-client';

window.__spyHead.init({
    pid: '1_1000',
    lid: 'xx',
    logServer: 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif',

    // 数据类型：异常，触发时间：OnLoadResourceError
    resourceError: {
        group: 'resource',
        sample: 1,
        handler: function (data: any) {
            data.dim.os = 'ios';
        }
    },
    // 数据类型：异常，触发时间：OnJSError
    jsError: {
        group: 'js',
        sample: 1,
        handler: function (data: any) {
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
        handler: function(data: any) {
            data.dim = {os: 'ios'};
        }
    }
});

async function checkSend(option: any, triggerCb: () => void, finishCb?: (urlObj: URL) => void) {
    option.timeout = option.timeout || 2000;
    await new Promise(resolve => {

        function recover() {
            // 恢复
            (navigator.sendBeacon as any).and.callThrough();
            // 监听src属性的变化
            const constructor = (new Image()).constructor.prototype;
            Object.defineProperty(constructor, 'src', {
                set(value) {
                    this.setAttribute('src', value);
                },
            });
        }

        // 超过2s没有发出就是有问题了
        const timer = setTimeout(() => {
            expect('timeout > ' + option.timeout).toBe('failure');
            recover();
            resolve('');
        }, option.timeout);

        function checkUrl(url: string) {
            const urlObj = new URL(url);
            expect(urlObj.pathname).toContain('/mwb2.gif');
            expect(urlObj.searchParams.get('pid')).toEqual('1_1000');
            expect(urlObj.searchParams.get('type')).toEqual(option.type);
            expect(urlObj.searchParams.get('lid')).toEqual('xx');
            expect(urlObj.searchParams.get('ts')).toMatch(/\d{11}/);
            expect(urlObj.searchParams.get('group')).toEqual(option.group || 'common');
            clearTimeout(timer);
            if (finishCb) {
                finishCb(urlObj);
            }
            recover();
            resolve('');
        }

        spyOn(navigator, 'sendBeacon').and.callFake(url => { // specify callFake
            checkUrl(url);
            return false;
        });

        // let constructor = document.createElement('img').constructor.prototype;
        // if (!constructor) {
        //     return;
        // }
        const constructor = (new Image()).constructor.prototype;
        // 重写setAttribute方法
        // let originsetAttribute = constructor.setAttribute;
        // constructor.setAttribute = function (...args) {
        //     const [attr, value] = args;
        //     originsetAttribute.apply(this, args);
        //     if (attr === attrName && value) {
        //         addErrorListener(this);
        //     }
        // };

        // 监听src属性的变化
        Object.defineProperty(constructor, 'src', {
            set(value) {
                if (value.indexOf('/mwb2.gif') > -1) {
                    checkUrl(value);
                }
                else {
                    this.setAttribute('src', value);
                }
            },
        });

        triggerCb();
    });
}


describe('spy-head', async () => {
    beforeEach(async () => {

    });

    afterEach(async () => {

    });

    // 无法模拟全局JS报错，会被判断错误，导致测试失败
    // it('check jsError', async () => {
    //     // 选项来自test/head-conf.js
    //     const option = {
    //         pid: '1_1000',
    //         lid: 'xx',
    //         type: 'except',
    //         group: 'js',
    //     };

    //     await checkSend(option, () => {
    //         // mock js error
    //         // setTimeout(() => {
    //         //     var obj = {};
    //         //     (obj as any).runError();
    //         // });
    //     });
    // });

    // chrome可以过，但TRAVIS headless chrome过不了
    if (process.env.TRAVIS) {
        return;
    }

    it('check whiteScreen', async () => {
        // 选项来自test/head-conf.js
        const option = {
            pid: '1_1000',
            lid: 'xx',
            type: 'except',
            group: 'whiteScreen',
            timeout: 6000
        };
        await checkSend(option, function () {}, urlObj => {
            if (!urlObj.searchParams.get('info')) {
                throw new Error('no info');
            }
            if (!urlObj.searchParams.get('dim')) {
                throw new Error('no dim');
            }
            const info = JSON.parse(urlObj.searchParams.get('info') || '{}');
            const dim = JSON.parse(urlObj.searchParams.get('dim') || '{}');
            expect(dim.os).toEqual('ios');
            expect(info.msg).toEqual('WhiteScren Error');
        });
    });
    it('check resourceError', async () => {
        // 选项来自test/head-conf.js
        const option = {
            pid: '1_1000',
            lid: 'xx',
            type: 'except',
            group: 'resource',
        };

        const url = 'https://mss0.bdstatic.com/se/static/js/iphone/zbios/zbiosT_f69.js';

        await checkSend(option, () => {
            // mock js error
            // mock 404 js
            const script = document.createElement('script');
            script.src = url;
            document.body.appendChild(script);
        }, urlObj => {
            if (!urlObj.searchParams.get('info')) {
                throw new Error('no info');
            }
            if (!urlObj.searchParams.get('dim')) {
                throw new Error('no dim');
            }
            const info = JSON.parse(urlObj.searchParams.get('info') || '{}');
            const dim = JSON.parse(urlObj.searchParams.get('dim') || '{}');
            expect(dim.os).toEqual('ios');
            expect(info.msg).toEqual(url);
        });
    });


});
