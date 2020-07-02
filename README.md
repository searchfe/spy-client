# spy-client [![Build Status](https://travis-ci.com/kaivean/spy-client.svg?branch=master)](https://travis-ci.com/kaivean/spy-client)

## 介绍
日志采集模块，提供一系列方便的api供使用

## 安装

新版2.x部分API不再兼容1.x

```
npm install spy-client --save
```

CDN方式

不是一次性3个JS都引入，具体往下看

```html
<!--增强版SDK-->
<script src="https://code.bdstatic.com/npm/spy-client@2.0.3/dist/spy-client.min.js" type="text/javascript"></script>

<!--增强版SDK spy-head-->
<script src="https://code.bdstatic.com/npm/spy-client@2.0.3/dist/spy-head.min.js" type="text/javascript"></script>

<!--基础版SDK-->
<script src="https://code.bdstatic.com/npm/spy-client@2.0.3/dist/spy-client-basic.min.js" type="text/javascript"></script>

```

> 如果对于一些指标想理解更准确，看源码是最佳方式 [SDK源码](https://github.com/kaivean/spy-client)


> SDK的指标采集请酌情选用，不要一股脑全用上，如果只用了一项采集功能，但SDK体积太大，可以考虑自行编译，看文档最后


## 快速使用

初始化
```javascript
const SpyClient = require('spy-client');
const spy = new SpyClient({
    pid: '1_1000', // 必须
    lid: '', // 可选，页面的logid
    sample: 1 // 可选，默认为1, 全局抽样，取值：[0-1], 所有发送接口都受到该抽样，单个发送接口的sample配置会覆盖该抽样。
});
```

发送性能日志
```javascript
// 发送性能日志
spy.sendPerf({
    // 可选, 分组，默认common，用户自定义
    group: 'test',
    // 必须, 指标信息，每个字段为一个指标，由用户自定义，这里的fisrtScreen、whiteScreen等都是业务自己定义，后续会在平台上配置好，平台会从该字段取对应指标信息。
    // 这些指标需要你自行计算好时间再发送，不能带单位
    info: {
        tcp: 1200,
        domReady: 600
    },
    // 可选，维度信息，每个字段为一个维度，由用户自定义，这里的netType、pageType都是业务自己定义，后续会在平台上配置好，平台会从该字段取对应维度信息。
    dim: {
        os: 'ios',
        netType: 'wifi'
    }
});
```

## SDK说明
SDK分两种

* 基础版SDK：提供最基础和最简单的功能，如果这些功能能满足你，那么直接使用该SDK即可，因为体积较小
* 增强版SDK：除了基础版SDK功能外，集合了丰富的常用的性能和异常指标统计

接下来分别介绍

## 基础版SDK
提供最基础和最简单的功能，如果这些功能能满足你，那么直接使用该SDK即可

```javascript
// basic spy-client 基本用法，最简单功能
const SpyClient = require('spy-client/dist/spy-client-basic');
const spy = new SpyClient({
    pid: '1_1000', // 必须
    lid: '', // 可选，页面的logid
    sample: 1 // 可选，默认为1, 全局抽样，取值：[0-1], 所有发送接口都受到该抽样，单个发送接口的sample配置会覆盖该抽样。
});
```

以下先简单列举所有可用API示例
```javascript

// 发生性能日志，本质是数值型的metric数据
spy.sendPerf({
    // 可选, 分组，默认common，用户自定义
    group: 'test',
    // 必须, 指标信息，每个字段为一个指标，由用户自定义，这里的fisrtScreen、whiteScreen等都是业务自己定义，后续会在平台上配置好，平台会从该字段取对应指标信息。
    // 这些指标需要你自行计算好时间再发送，不能带单位
    info: {
        tcp: 1200,
        domReady: 600
    },
    // 可选，维度信息，每个字段为一个维度，由用户自定义，这里的netType、pageType都是业务自己定义，后续会在平台上配置好，平台会从该字段取对应维度信息。
    dim: {
        os: 'ios',
        netType: 'wifi'
    }
});


// 发送异常日志
spy.sendExcept({
    // 必须, 异常信息，msg字段是必须的，是异常唯一标识。其他字段作为补充信息，由用户自定义
    info: {
        msg: 'abc is not undefined',
        stack: 'xxxxx',
        file: 'xxxxxxx'
    },
    // 可选, 分组，默认common，用户自定义
    group: 'test',
    // 可选，维度信息，每个字段为一个维度，由用户自定义
    dim: {
        os: 'ios'
    }
});

// 发送分布日志
spy.sendDist({
    info: {
        from: 'hao123'
    },
    dim: {
        os: 'ios'
    }
});

// 发送计数日志
spy.sendCount({
    info: {
        from: 'hao123'
    },
    dim: {
        os: 'ios'
    }
});

// 如果能拿到error实例，通过该方法快速上报异常，默认会获取stack等信息
spy.sendExceptForError(new Error('error'), {
    dim: {
        os: 'ios'
    }
});

// 最基础的API需要自行指定type字段
spy.send({
    type: 'perf'
    info: {
        domReady: 1000
    },
    dim: {}
});


// 统计辅助方法
spy.startMark('playTime');
let time = spy.endMark('playTime');
console.log(time); // output: 1000

spy.startMark('pauseTime');
spy.endMark('pauseTime'); // 假设中间执行花费1s
console.log(spy.getAllMark());
// output
// {
//     playTime: 1000,
//     pauseTime: 1000
// }

spy.clearMark('pauseTime'); // 清除pauseTime
spy.clearAllMark(); // 清除所有mark的信息

```


## 增强版SDK

增强版SDK分成了2部分

1. spy-head：有些功能我们希望越早生效越好，比如全局JS报错监控。因此把这些功能最小集抽成一个单独JS，以便可以插入head标签内，也不会全量引入整个SDK在头部。当然，放到任何地方都是可以，开发者自行决策即可。此部分包含的功能有
    * 异常：全局JS报错监控、资源加载失败监控、白屏异常监控
    * 性能：Longtask等信息采集，真正的统计是在spy-client里，只是越早采集，能获取更多的longtask

2. spy-client：此部分提供了丰富的性能和异常的指标统计，其中部分功能依赖于spy-head，包含的功能有
    * 性能指标采集：包含体积、卡顿、速度等60+个性能指标采集方法
    * 异常：包含大于100K的大图片采集、HTTPS环境下HTTP资源采集
    * 辅助方式： mark系列辅助方法

### spy-head使用

spy-head JS可以视情况script内联或嵌入其他JS里

> 如果要启用一项异常监控功能，需要设置其抽样sample不为0

```html
<script>
// spy-head js可以视情况script内联或外链，外链地址可见文档开头的CDN
const spyHead = require('spy-client/dist/spy-head');
spyHead.init({
    pid: '1_1', // spy申请的pid
    lid: '', // 业务的log id，可选

    // 数据类型：异常，触发时间：监听的window.addEventListen('error')有资源加载失败时
    // 上报信息里包含资源的标签名，资源地址，xpath
    // 用不着的话，需要删掉这个配置
    resourceError: {
        // 发送的分组名称，可以自定义
        group: 'resource',
        // 抽样，禁用可以设置为0
        sample: 1,
        // 对发送之前的数据进行操作，如果不想发送，返回false即可
        // 如果想增加维度，可以自定加上data.dim字段
        // 用不着的话，可以删掉这个函数
        handler: function (data) {

        }
    },
    // 数据类型：异常，触发时间：监听的全局报错window.addEventListen('error')，有未被捕获的全局异常抛出时
    // 上报信息里包含错误message，stack，之前已发生的所有错误等
    // 用不着的话，需要删掉这个配置
    jsError: {
        // 发送的分组名称，可以自定义
        group: 'js',
        // 抽样，禁用可以设置为0
        sample: 1,
        // 对发送之前的数据进行操作，如果不想发送，返回false即可
        // 如果想增加维度，可以自定加上data.dim字段
        // 用不着的话，可以删掉这个函数
        handler: function (data) {

        }
    },
    // 数据类型：异常，触发时间：OnJudgeReturnFalseWhenTimeout
    // 上报信息里包含之前已发生的所有错误、dns、tcp、请求响应时间（可能为负，说明该过程没有完成）、设备信息等
    // 用不着的话，需要删掉这个配置
    whiteScreenError: {
        // 抽样，禁用可以设置为0
        sample: 1,
        // 发送的分组名称，可以自定义
        group: 'whiteScreen',
        // 一旦以下逻辑不满足，就认为白屏：document.querySelector(selector)的元素包含 document.querySelector(selector).querySelector(subSelector) 并且 document.querySelector(selector) 的高度大于屏幕高度的2/3
        selector: 'body',
        subSelector: 'button1',
        // 单位ms，在timeout后，执行上述检测
        timeout: 6000,
        // 对发送之前的数据进行操作，如果不想发送，返回false即可
        // 如果想增加维度，可以自定加上data.dim字段
        // 用不着的话，可以删掉这个函数
        handler: function(data) {

        }
    }
});
<script>
```

> 像Vue等组件框架会对组件代码做try catch，然后打印到console，这种错误情况是不会有全局错误的，即window.onerror不会触发。只能使用框架的全局error回调（比如Vue.config.errorHandler）去拿到错误信息，再调用spy.sendExcept上报。
> 所以在发现上述jsError全局异常监听失效时，请先自行调试是否能通过window.addEventListen('error')监听到

### 主体SDK spy-client

```javascript
// enhanced spy-client 全集功能用法
const SpyClient = require('spy-client');
const spy = new SpyClient({
    pid: '1_1000', // 必须
    lid: '', // 可选，页面的logid
    sample: 1 // 可选，默认为1, 全局抽样，取值：[0-1], 所有发送接口都受到该抽样，单个发送接口的sample配置会覆盖该抽样。
});
```


#### 基于performance timing的基本指标

```javascript
// 类型：性能，触发时间：500MsAfterOnLoad，说明：performance timing的数据采集基本指标
spy.listenTiming(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface TimingMetric {
    // dns解析
    dns: number;
    // tcp链接
    tcp: number;
    // 主文档请求
    request: number;
    // 主文档响应时间
    response: number;
    // DOM解析时间：Dom解析开始到结束时间
    // 这是从页面部分数据返回，浏览器开始解析doc元素到最底部的script脚本解析执行完成
    // 脚本里触发的异步方法或绑定了更靠后的事件，不再纳入范围内
    parseHtml: number;
    // DOM解析完成总时间：页面开始加载到Dom解析结束
    // 很多事件绑定是在domContentLoaded事件里的，所以等其结束，一般页面元素的事件绑定好了，用户可以正确交互
    // 当然存在在该加载事件之后绑定元素事件情况，但不再此考虑范围内
    domReady: number;
    // 处理所有注册的load事件函数的时间
    loadEventHandle: number;
    // onload完成时间
    // 基本该做的都做完，资源也都加载完成了
    // 当然在onload事件处理函数里启动了异步方法，不再纳入范围内
    load: number;
    // first-paint https://w3c.github.io/paint-timing/#sec-PerformancePaintTiming
    fp?: number;
    // first-contentful-paint  https://w3c.github.io/paint-timing/#sec-PerformancePaintTiming
    fcp?: number;
    // T7内核计算的首次绘制, 单位ms
    t7FirstPaint?: number;
    // T7内核计算的首屏时间, 单位ms
    t7FirstScreen?: number;
}
```

#### Largest Contentful Paint

最大块内容绘制完成时间

* 依赖：spy-head.js

```javascript
// 类型：性能，触发时间：500MsAfterOnLoad
spy.listenLCP(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface LCPMetric {
    // Largest Contentful Paint https://web.dev/lcp/
    // 在onload时间内最大块内容绘制完成时间
    lcp: number;
}
```

#### FID

首次输入延迟，衡量首次交互卡顿

* 依赖：spy-head.js


```javascript
// 类型：性能，触发时间：OnInput
spy.listenFID(function (metric) {
    spy.sendPerf({
        group: 'fid',
        info: metric
    });
});
```

metric定义

```typescript
export interface FIDMetric {
    // First Input Delay https://web.dev/fid/
    // 首次输入延迟
    fid: number;
}
```

#### TTI

用户可完全交互时间

```javascript
// 数据类型：性能，触发时间：当第一次出现5s内没有网络请求（默认排查了gif请求），且没有longtask产出时
spy.listenTTI(function (metric) {
    spy.sendPerf({
        group: 'tti',
        info: metric
    });
});
```

metric定义

```typescript
export interface TTIMetric {
    // Time to Interactive https://web.dev/tti/
    // 用户可完全交互时间
    tti: number;
}
```

#### 获取资源信息

获取资源的本身大小、传输大小、数量、传输、缓存率

```javascript
// 数据类型：性能，触发时间：500MsAfterOnLoad
spy.listenResource(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface ResourceMetric {
    // 页面整体大小：包括主文档、所有JS、CSS、Img、Font，单位KB
    allSize: number;
    // 主文档大小 KB
    docSize: number;
    // 主文档的响应header的大小，包含cookie等 KB
    headerSize: number;

    // js外链的个数
    jsNum: number;
    cssNum: number;
    imgNum: number;
    fontNum: number;

    // 所有JS外链的大小
    jsSize: number;
    cssSize: number;
    imgSize: number;
    fontSize: number;

    // 页面整体网络传输大小，通常来说资源有了缓存，传输大小就为0，另外有Gzip的话，传输大小相比资源本身大小也要小很多
    allTransferSize: number;
    // 主文档网络传输大小
    docTransferSize: number;
    // 所有JS外链的传输大小
    jsTransferSize: number;
    cssTransferSize: number;
    imgTransferSize: number;
    fontTransferSize: number;

    // js cache率
    jsCacheRate: number;
    cssCacheRate: number;
    imgCacheRate: number;
};
```

#### 大于100KB的大图检测
```javascript
// 数据类型：异常，触发时间：500MsAfterOnLoad
spy.listenBigImg(function (info) {
    spy.sendExcept({
        info: info
    });
});
```

info定义

```typescript
export interface ResourceErrorInfo {
    // 发生异常的资源链接
    msg: string;
    // 发生异常的资源元素的xpath信息，一直到body
    xpath: string;
}
```


#### HTTPS页面里的HTTP资源检测
```javascript
// 数据类型：异常，触发时间：500MsAfterOnLoad
spy.listenHttpResource(function (info) {
    spy.sendExcept({
        info: info
    });
});
```

info定义

```typescript
export interface ResourceErrorInfo {
    // 发生异常的资源链接
    msg: string;
    // 发生异常的资源元素的xpath信息，一直到body
    xpath: string;
}
```


#### T7内核首屏时间内的LongTask信息

* 依赖：spy-head.js

```javascript
// 数据类型：性能，触发时间：OnLoad
spy.listenFSPLongTask(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface FSPLongtaskMetric {
    // 在T7内核首屏时间内， 每个longtask的时间总和
    fspLongtaskTime: number;
    // 在T7内核首屏时间内，Total Blocking Time时间总和，即Sum(每个longtask的时间 - 50）
    // Total Blocking Time定义：
    fspTBT: number;
    // T7内核首屏时间
    fspTotalTime: number;
    // 在T7内核首屏时间内, Longtask率 = 100 * fspLongtaskTime / fspTotalTime
    fspLongtaskRate: number;
    // 在T7内核首屏时间内的Longtask数量
    fspLongtaskNum: number;
}
```


#### Largest Contentful Paint时间内LongTask信息

* 依赖：spy-head.js

```javascript
// 数据类型：性能，触发时间：500MsAfterOnLoad
spy.listenLCPLongTask(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface LCPLongtaskMetric {
    // 在Largest Contentful Paint时间内， 每个longtask的时间总和
    lcpLongtaskTime: number;
    // 在Largest Contentful Paint时间内，Total Blocking Time时间总和，即Sum(每个longtask的时间 - 50）
    lcpTBT: number;
    // Largest Contentful Paint时间
    lcpTotalTime: number;
    // 在Largest Contentful Paint时间内, Longtask率 = 100 * lcpLongtaskTime / lcpTotalTime
    lcpLongtaskRate: number;
    // 在Largest Contentful Paint时间内的Longtask数量
    lcpLongtaskNum: number;
}
```


#### 页面加载过程的LongTask信息

* 依赖：spy-head.js

```javascript
// 数据类型：性能，触发时间：OnLoad
spy.listenLoadLongTask(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface LoadLongtaskMetric {
    // 在onload即页面加载完成时间内， 每个longtask的时间总和
    loadLongtaskTime: number;
    // 在onload即页面加载完成时间内，Total Blocking Time时间总和，即Sum(每个longtask的时间 - 50）
    loadTBT: number;
    // onload即页面加载完成时间
    loadTotalTime: number;
    // 在onload即页面加载完成时间内, Longtask率 = 100 * loadLongtaskTime / loadTotalTime
    loadLongtaskRate: number;
    // 在onload即页面加载完成时间内的Longtask数量
    loadLongtaskNum: number;
}
```


#### 页面完整周期内的LongTask信息

开始加载页面到第一次离开页面(隐藏或点出)时间内的LongTask信息

* 依赖：spy-head.js

```javascript
// 数据类型：性能，触发时间：OnLeavingPageFirstly
spy.listenPageLongTask(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface PageLongtaskMetric {
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内， 每个longtask的时间总和
    pageLongtaskTime: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内，Total Blocking Time时间总和，即Sum(每个longtask的时间 - 50）
    pageTBT: number;
    // 开始加载页面到第一次离开页面(隐藏或点出)时间
    pageTotalTime: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内, Longtask率 = 100 * pageLongtaskTime / pageTotalTime
    pageLongtaskRate: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内的Longtask数量
    pageLongtaskNum: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内，每个来自iframe内的longtask的时间总和
    pageIframeLongtaskTime: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内，每个来自iframe内的Longtask率 = 100 * pageIframeLongtaskTime / pageTotalTime
    pageIframeLongtaskRate: number;
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内，每个来自iframe内的Longtask数量
    pageIframeLongtaskNum: number;
}
```

#### Cumulative Layout Shift

页面布局的变化程度, 变化过多，可能让用户觉得页面不稳定，抖动

* 依赖：spy-head.js

```javascript
// 数据类型：性能，触发时间：OnLeavingPageFirstly
spy.listenLayoutShift(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface LayoutShiftMetric {
    // Cumulative Layout Shift定义 https://web.dev/cls/
    // 在开始加载页面到第一次离开页面(隐藏或点出)时间内的 Cumulative Layout Shift
    layoutShift: number;
}
```

#### 内存信息

页面使用内存信息

在页面第一次离开时（隐藏或点出）触发

```javascript
// 数据类型：性能，触发时间：在页面第一次离开时（隐藏或点出）
spy.listenMemory(function (metric) {
    spy.sendPerf({
        info: metric
    });
});
```

metric定义

```typescript
export interface MemoryMetric {
    // 已使用内存, 单位KB
    usedJSHeapSize: number;
    // 分配给页面的内存，单位KB
    totalJSHeapSize: number;
    // 内存限制，单位KB
    jsHeapSizeLimit: number;
    // 内存使用率百分比 = 100 * usedJSHeapSize / totalJSHeapSize
    usedJSHeapRate: number;
}
```

#### Navigator信息

获取一些设备信息

```javascript
// 数据类型：性能，触发时间：OnLoad
const info = spy.getNavigatorInfo();
```

info定义

```typescript
export interface NavigatorInfoMetric {
    // 网络下载速度 https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/connection
    downlink?: number;
    // 网络类型
    effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
    // 估算的往返时间
    rtt?: number;
    // 数据保护模式
    saveData?: boolean;
    // 设备内存 https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
    deviceMemory?: number;
    // 设备逻辑核数  https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency
    hardwareConcurrency?: number;
}
```

## Example

样例参考 [Example](https://github.com/kaivean/spy-client/blob/master/example/index.html)


## 自定义构建

#### clone准备
如果觉得spy-client太大，只想要部分模块，比如禁用 longtask，可以拉取源码，自行编译

```
git clone https://github.com/kaivean/spy-client.git

cd spy-log
npm install
```

#### 禁用模块
比如禁用longtask，前往`src/spy-client.ts`

在顶部注释掉import
```typescript
// import Longtask from './module/longtask';
```

在constructor里注释掉register
```typescript
// this.register(new Longtask());
```


#### 构建

```bash
npm run build
```

然后找到dist/spy-client.min.js 就是构建压缩版代码


## 开发

```bash
# 启动本地调试页面，进行调试
npm run example

# 进行watch 编译， 一般和上个命令配合使用
npm run watch

# lint
npm run lint

# 测试
npm run test

# production编译，产出到dist
npm run build

# development编译，产出到dist
npm run dev

# 发布npm包
npm run release_pre
npm run release
npm run release_post
```