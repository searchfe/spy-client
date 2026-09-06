import {test, expect} from '@playwright/test';
import {gotoFixture} from './helpers';

test.beforeEach(async ({page}) => {
    await gotoFixture(page);
});

test('mark 功能', async ({page}) => {
    const result = await page.evaluate(async () => {
        const SpyClient = (window as any).SpyClient;
        const spy = new SpyClient({pid: '1_1000', lid: 'xx'});

        spy.startMark('playtime');
        spy.startMark('playtime2');
        await new Promise(r => setTimeout(r, 50));
        const time = spy.endMark('playtime');
        const time2 = spy.endMark('playtime2');
        const all = spy.getAllMark();

        spy.clearAllMark();
        const afterClearAll = spy.getAllMark();

        spy.startMark('playtime3');
        spy.clearMark('playtime3');
        const afterClearMark = spy.getAllMark();

        return {time, time2, all, afterClearAll, afterClearMark};
    });

    expect(typeof result.time).toBe('number');
    expect(result.time).toBeGreaterThanOrEqual(50);
    expect(typeof result.time2).toBe('number');
    expect(result.time2).toBeGreaterThanOrEqual(50);
    expect(result.all).toMatchObject({playtime: result.time, playtime2: result.time2});
    expect(result.afterClearAll).toEqual({});
    expect(result.afterClearMark).toEqual({});
});
