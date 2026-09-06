import {test, expect, Page} from '@playwright/test';
import {gotoFixture, captureNextLog, PID, LID} from './helpers';

function checkCommon(url: URL) {
    expect(url.pathname).toContain('/mwb2.gif');
    expect(url.searchParams.get('pid')).toBe(PID);
    expect(url.searchParams.get('lid')).toBe(LID);
    expect(url.searchParams.get('ts')).toMatch(/\d{11}/);
}

async function sendAndCheck(page: Page, method: string, option: any, type: string) {
    const urlPromise = captureNextLog(page);
    await page.evaluate(({method, option}) => {
        const SpyClient = (window as any).SpyClient;
        const spy = new SpyClient({pid: '1_1000', lid: 'xx'});
        (spy as any)[method](option);
    }, {method, option});

    const url = new URL(await urlPromise);
    checkCommon(url);
    expect(url.searchParams.get('type')).toBe(type);
    expect(url.searchParams.get('group')).toBe(option.group || 'common');
    expect(url.searchParams.get('info')).toBe(JSON.stringify(option.info));
    expect(url.searchParams.get('dim')).toBe(JSON.stringify(option.dim));
}

test.beforeEach(async ({page}) => {
    await gotoFixture(page);
});

test('性能发送', async ({page}) => {
    await sendAndCheck(page, 'sendPerf', {
        group: 'kpi',
        info: {firstScreen: 1},
        dim: {os: 'ios #8&中'},
    }, 'perf');
});

test('异常发送', async ({page}) => {
    await sendAndCheck(page, 'sendExcept', {
        group: 'js',
        info: {msg: 'not defined'},
        dim: {os: 'ios'},
    }, 'except');
});

test('计数发送', async ({page}) => {
    await sendAndCheck(page, 'sendCount', {
        group: 'click',
        info: {buttonclick: 1},
        dim: {os: 'ios'},
    }, 'count');
});

test('分布发送', async ({page}) => {
    await sendAndCheck(page, 'sendDist', {
        group: 'cookie',
        info: {isHit: 1},
        dim: {os: 'ios'},
    }, 'dist');
});

test('trycatch异常发送', async ({page}) => {
    const urlPromise = captureNextLog(page);
    await page.evaluate(() => {
        const SpyClient = (window as any).SpyClient;
        const spy = new SpyClient({pid: '1_1000', lid: 'xx'});
        try {
            throw new Error('try catch error');
        }
        catch (e) {
            const err = e as Error;
            delete err.stack;
            spy.sendExceptForError(err, {group: 'trycatch', dim: {os: 'ios'}});
        }
    });

    const url = new URL(await urlPromise);
    checkCommon(url);
    expect(url.searchParams.get('type')).toBe('except');
    expect(url.searchParams.get('group')).toBe('trycatch');
    expect(url.searchParams.get('dim')).toBe(JSON.stringify({os: 'ios'}));
    const info = JSON.parse(url.searchParams.get('info') || '{}');
    expect(info.msg).toBe('try catch error');
});
