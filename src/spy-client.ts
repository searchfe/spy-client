/**
 * @file SpyClient
 * @author kaivean
 */

import SpyClientBasic from './spy-client-basic';

import {
    Module,
    SpyClientOption,

    FIDCB,
    LCPCB,
    LayoutShiftCB,
    PageLongtaskCB,
    LoadLongtaskCB,
    LCPLongtaskCB,
    FSPLongtaskCB,
    MemoryCB,
    NavigatorInfoMetric,
    ResourceCB,
    ResourceErrorCB,
    TimingCB,
    TTICB,
    TTIOption,

    ResOption,
    BigImgOption,
    HttpResOption,
    SlowOption
} from './lib/interface';

import FID from './module/fid';
import LayoutShift from './module/layoutShift';
import LCP from './module/lcp';
import TTI from './module/tti';
import Timing from './module/timing';
import Resource from './module/resource';
import Memory from './module/memory';
import NavigatorInfo from './module/navigatorInfo';
import Longtask from './module/longtask';

export default class SpyClient extends SpyClientBasic {
    private readonly modules: Module[] = [];

    constructor(option: SpyClientOption) {
        super(option);

        this.register(new FID());
        this.register(new LCP());
        this.register(new LayoutShift());
        this.register(new TTI());
        this.register(new Timing());
        this.register(new Resource());
        this.register(new Memory());
        this.register(new NavigatorInfo());
        this.register(new Longtask());

        this.visibilitychangeCB = this.visibilitychangeCB.bind(this);
        this.load = this.load.bind(this);
        this.leave = this.leave.bind(this);

        if (document.readyState === 'complete') {
            this.load();
        }
        else {
            window.addEventListener('load', this.load);
        }

        document.addEventListener('visibilitychange', this.visibilitychangeCB);
        window.addEventListener('beforeunload', this.leave, false);
        window.addEventListener('unload', this.leave, false);
    }

    listenFID(cb: FIDCB) {
        this.invoke('listenFID', cb as any);
    }

    listenLayoutShift(cb: LayoutShiftCB) {
        this.invoke('listenLayoutShift', cb as any);
    }

    listenLCP(cb: LCPCB) {
        this.invoke('listenLCP', cb as any);
    }

    listenFSPLongTask(cb: FSPLongtaskCB) {
        this.invoke('listenFSPLongTask', cb as any);
    }

    listenLCPLongTask(cb: LCPLongtaskCB) {
        this.invoke('listenLCPLongTask', cb as any);
    }

    listenLoadLongTask(cb: LoadLongtaskCB) {
        this.invoke('listenLoadLongTask', cb as any);
    }

    listenPageLongTask(cb: PageLongtaskCB) {
        this.invoke('listenPageLongTask', cb as any);
    }

    listenMemory(cb: MemoryCB) {
        this.invoke('listenMemory', cb as any);
    }

    getNavigatorInfo(): NavigatorInfoMetric {
        return this.invoke('getNavigatorInfo');
    }

    listenResource(cb: ResourceCB, option?: ResOption) {
        this.invoke('listenResource', cb as any, option);
    }

    listenBigImg(cb: ResourceErrorCB, option?: BigImgOption) {
        this.invoke('listenBigImg', cb as any, option);
    }

    listenHttpResource(cb: ResourceErrorCB, option?: HttpResOption) {
        this.invoke('listenHttpResource', cb as any, option);
    }

    listenSlowResource(cb: ResourceErrorCB, option?: SlowOption) {
        this.invoke('listenSlowResource', cb as any, option);
    }

    listenTiming(cb: TimingCB) {
        this.invoke('listenTiming', cb as any);
    }

    listenTTI(cb: TTICB, option?: TTIOption) {
        this.invoke('listenTTI', cb as any, option as any);
    }

    invoke(name: string, cb?: any, option?: any) {
        for (let index = 0; index < this.modules.length; index++) {
            const mod = this.modules[index];
            if (typeof (mod as any)[name] === 'function') {
                return (mod as any)[name].apply(mod, [cb, option]);
            }
        }
        console.error('no method', name);
    }

    register(mod: Module) {
        this.modules.push(mod);
    }

    load() {
        for (let index = 0; index < this.modules.length; index++) {
            const mod = this.modules[index];
            mod.load && mod.load();
        }
    }

    leave() {
        for (let index = 0; index < this.modules.length; index++) {
            const mod = this.modules[index];
            mod.leave && mod.leave();
        }
    }

    destroy() {
        for (let index = 0; index < this.modules.length; index++) {
            const mod = this.modules[index];
            mod.destroy && mod.destroy();
        }

        document.removeEventListener('visibilitychange', this.visibilitychangeCB);
        window.removeEventListener('load', this.load);
        window.removeEventListener('beforeunload', this.leave);
        window.removeEventListener('unload', this.destroy);
    }

    private visibilitychangeCB() {
        if (document.visibilityState === 'hidden') {
            this.leave();
        }
    }
}