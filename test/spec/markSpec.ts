/**
 * @file main-spec
 * @author kaivean
 */

import SpyClient from 'spy-client';


describe('mark', async () => {
    let time: number;
    let time2: number;
    let spy: any;
    beforeEach(async () => {
        spy = new SpyClient({
            pid: '1_1000',
            lid: 'xx',
        });

        await new Promise(resolve => {
            spy.startMark('playtime');
            spy.startMark('playtime2');
            setTimeout(() => {
                time = spy.endMark('playtime');
                time2 = spy.endMark('playtime2');
                resolve('');
            }, 50);
        });
    });

    // afterEach(() => {
    // });

    it('endMark', () => {
        expect(typeof time === 'number').toBe(true);
        expect(time).toBeGreaterThanOrEqual(50);
    });


    it('getAllMark', () => {
        const ret = spy.getAllMark();
        expect(ret).toEqual(
            jasmine.objectContaining({
                playtime: time,
                playtime2: time2,
            })
        );
    });

    it('clearAllMark', () => {
        spy.clearAllMark();
        expect(spy.getAllMark()).toEqual({});
    });

    it('clearMark', () => {
        spy.clearMark('playtime2');
        const ret = spy.getAllMark();
        expect(ret).not.toEqual(
            jasmine.objectContaining({
                playtime2: time2,
            })
        );
        expect(ret).toEqual(
            jasmine.objectContaining({
                playtime: time,
            })
        );
    });
});
