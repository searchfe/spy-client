import {test, expect, Page} from '@playwright/test';
import {gotoFixture} from './helpers';

async function expectConsoleError(page: Page, trigger: () => void, contains: string) {
    const msgPromise = page.waitForEvent('console', {
        predicate: msg => msg.type() === 'error' && msg.text().includes(contains),
        timeout: 5000,
    });
    await page.evaluate(trigger);
    const msg = await msgPromise;
    expect(msg.text()).toContain(contains);
}

test.beforeEach(async ({page}) => {
    await gotoFixture(page);
});

test('group length check', async ({page}) => {
    await expectConsoleError(page, () => {
        const SpyClient = (window as any).SpyClient;
        const spy = new SpyClient({pid: '1_1000', lid: 'xx'});
        spy.sendPerf({
            group: 'kpifwejfwalfjFWEFWJEFWFWAFALJFEWLFALJWEFLAWJF',
            info: {firstScreen: 1},
            dim: {os: 'ios'},
        });
    }, 'group length execeeds 30');
});

test('info key length check', async ({page}) => {
    await expectConsoleError(page, () => {
        const SpyClient = (window as any).SpyClient;
        const spy = new SpyClient({pid: '1_1000', lid: 'xx'});
        spy.sendPerf({
            group: 'kpi',
            info: {firstScreenfwfewfafawfwagewgawgwegwegweagweagweg: 1},
            dim: {os: 'ios'},
        });
    }, 'is unexpected');
});

test('dim key length check', async ({page}) => {
    await expectConsoleError(page, () => {
        const SpyClient = (window as any).SpyClient;
        const spy = new SpyClient({pid: '1_1000', lid: 'xx'});
        spy.sendPerf({
            group: 'kpi',
            info: {firstScreen: 1},
            dim: {osfwfawfwafwefawefwefawfwafwfwfafafewefwffwaefwf: 'ios'},
        });
    }, 'dim key [osfwfawfwafwefawefwefawfwafwfwfafafewefwffwaefwf] is unexpected');
});

test('dim value check', async ({page}) => {
    await expectConsoleError(page, () => {
        const SpyClient = (window as any).SpyClient;
        const spy = new SpyClient({pid: '1_1000', lid: 'xx'});
        spy.sendPerf({
            group: 'kpi',
            info: {firstScreen: 1},
            dim: {os: 'Android (8)'},
        });
    }, 'dim.os value [Android (8)] is unexpected.');
});

test('except info msg check', async ({page}) => {
    await expectConsoleError(page, () => {
        const SpyClient = (window as any).SpyClient;
        const spy = new SpyClient({pid: '1_1000', lid: 'xx'});
        spy.sendExcept({
            group: 'kpi',
            info: {lineno: 1},
            dim: {os: 'ios'},
        });
    }, 'info.msg field must be not empty and is String');
});
