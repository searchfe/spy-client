/**
 * @file main-spec
 * @author kaivean
 */

import SpyClient from 'spy-client';

async function checkConsoleLog(option: any, triggerCb: (spy: any) => void, finishCb?: (spy: any, msg: string) => void) {
    const spy = new SpyClient({
        pid: '1_1000',
        lid: 'xx',
    });

    await new Promise(resolve => {
        function recover() {
            // 恢复
            (console.error as any).and.callThrough();
        }

        // 超过2s没有发出就是有问题了
        const timer = setTimeout(() => {
            expect('timeout > 2000').toBe('failure');
            recover();
            resolve('');
        }, 2000);

        spyOn(console, 'error').and.callFake((msg: string) => { // specify callFake
            clearTimeout(timer);
            if (finishCb) {
                finishCb(spy, msg);
            }
            recover();
            resolve('');
            return true;
        });

        triggerCb(spy);
    });
}

describe('问题检测能力', () => {
    beforeEach(() => {

        // window.dispatchEvent(event);
    });

    // afterEach(() => {
    // });

    it('group length check', async () => {
        await checkConsoleLog({}, spy => {
            const option = {
                group: 'kpifwejfwalfjFWEFWJEFWFWAFALJFEWLFALJWEFLAWJF',
                info: {
                    firstScreen: 1,
                },
                dim: {
                    os: 'ios',
                },
            };
            spy.sendPerf(option);
        }, (spy, msg) => {
            expect(msg).toContain('group length execeeds 30');
        });
    });

    it('info key length check', async () => {
        await checkConsoleLog({}, spy => {
            const option = {
                group: 'kpi',
                info: {
                    firstScreenfwfewfafawfwagewgawgwegwegweagweagweg: 1,
                },
                dim: {
                    os: 'ios',
                },
            };
            spy.sendPerf(option);
        }, (spy, msg) => {
            expect(msg).toContain('info.firstScreenfwfewfafawfwagewgawgwegwegweagweagweg is unexpected');
        });
    });

    it('dim key length check', async () => {
        await checkConsoleLog({}, spy => {
            const option = {
                group: 'kpi',
                info: {
                    firstScreen: 1,
                },
                dim: {
                    osfwfawfwafwefawefwefawfwafwfwfafafewefwffwaefwf: 'ios',
                },
            };
            spy.sendPerf(option);
        }, (spy, msg) => {
            expect(msg).toContain('dim key [osfwfawfwafwefawefwefawfwafwfwfafafewefwffwaefwf] is unexpected');
        });
    });

    it('dim value check', async () => {
        await checkConsoleLog({}, spy => {
            const option = {
                group: 'kpi',
                info: {
                    firstScreen: 1,
                },
                dim: {
                    os: 'Android (8)',
                },
            };
            spy.sendPerf(option);
        }, (spy, msg) => {
            expect(msg).toContain('dim.os value [Android (8)] is unexpected.');
        });
    });

    it('except info msg check', async () => {
        await checkConsoleLog({}, spy => {
            const option = {
                group: 'kpi',
                info: {
                    lineno: 1,
                },
                dim: {
                    os: 'ios',
                },
            };
            spy.sendExcept(option);
        }, (spy, msg) => {
            expect(msg).toContain('info.msg field must be not empty and is String');
        });
    });
});