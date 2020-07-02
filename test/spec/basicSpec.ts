/**
 * @file main-spec
 * @author kaivean
 */

import SpyClient from '../../dist/spy-client';

async function checkSend(option: any, triggerCb: (spy: any) => void, finishCb?: (spy: any) => void) {
    const spy = new SpyClient({
        pid: '1_1000',
        lid: 'xx',
    });

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
            expect('timeout > 2000').toBe('failure');
            recover();
            resolve();
        }, 2000);

        function checkUrl(url: string) {
            const urlObj = new URL(url);
            expect(urlObj.pathname).toContain('/mwb2.gif');
            expect(urlObj.searchParams.get('pid')).toEqual('1_1000');
            expect(urlObj.searchParams.get('type')).toEqual(option.type);
            expect(urlObj.searchParams.get('lid')).toEqual('xx');
            expect(urlObj.searchParams.get('ts')).toMatch(/\d{11}/);
            expect(urlObj.searchParams.get('group')).toEqual(option.group || 'common');
            expect(urlObj.searchParams.get('info')).toEqual(JSON.stringify(option.info));
            expect(urlObj.searchParams.get('dim')).toEqual(JSON.stringify(option.dim));
            clearTimeout(timer);
            if (finishCb) {
                finishCb(spy);
            }
            recover();
            resolve();
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
                // Ignore the IMG elements for sending Monitor.
                // this.setAttribute('src', value);
            },
        });

        triggerCb(spy);
    });
}

describe('基本发送功能', () => {
    beforeEach(() => {

        // window.dispatchEvent(event);
    });

    // afterEach(() => {
    // });

    it('性能发送', async () => {
        const option = {
            group: 'kpi',
            info: {
                firstScreen: 1,
            },
            dim: {
                os: 'ios #8&中',
            },
        };

        const checkOption = Object.assign({}, option, {
            type: 'perf',
        });

        await checkSend(checkOption, spy => {
            spy.sendPerf(option);
        });
    });

    it('异常发送', async () => {
        const option = {
            group: 'js',
            info: {
                msg: 'not defined',
            },
            dim: {
                os: 'ios',
            },
        };

        const checkOption = Object.assign({}, option, {
            type: 'except',
        });

        await checkSend(checkOption, spy => {
            spy.sendExcept(option);
        });
    });

    it('计数发送', async () => {
        const option = {
            group: 'click',
            info: {
                buttonclick: 1,
            },
            dim: {
                os: 'ios',
            },
        };

        const checkOption = Object.assign({}, option, {
            type: 'count',
        });

        await checkSend(checkOption, spy => {
            spy.sendCount(option);
        });
    });

    it('分布发送', async () => {
        const option = {
            group: 'cookie',
            info: {
                isHit: 1,
            },
            dim: {
                os: 'ios',
            },
        };

        const checkOption = Object.assign({}, option, {
            type: 'dist',
        });

        await checkSend(checkOption, spy => {
            spy.sendDist(option);
        });
    });


    it('trycatch异常发送', async () => {
        const option = {
            group: 'trycatch',
            info: {

            },
            dim: {
                os: 'ios',
            },
        };

        const checkOption = Object.assign({}, option, {
            type: 'except',
            info: {
                msg: 'try catch error',
            },
        });

        await checkSend(checkOption, spy => {
            try {
                throw new Error('try catch error');
            }
            catch (e) {
                delete e.stack;
                spy.sendExceptForError(e, {
                    group: 'trycatch',
                    dim: {
                        os: 'ios',
                    },
                });
            }
        });
    });
});
