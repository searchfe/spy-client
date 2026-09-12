# spy-client 开发指南

## 项目定位

本仓库是 spy 日志采集 SDK，使用 TypeScript 开发，提供基础版 `spy-client-basic`、增强版 `spy-client` 和可尽早加载的 `spy-head`。SDK 面向浏览器，也允许基础版通过覆盖 `request` 适配 Node.js、跨端框架和小程序。

SDK 只负责采集、校验、采样和发送，不负责 Nginx 接入、统计聚合或平台查询。修改发送协议时必须联动 `rec-nginx`、`webb-analysis`、`webb-realtime` 和平台查询。

## 技术栈和兼容性

- TypeScript 6、Rollup 4、TypeScript compiler。
- oxlint 静态检查。
- Playwright Test 端到端测试，使用本机 Chrome，不下载 Playwright 浏览器。
- `core-js` 运行时依赖。
- Performance、Long Task、LCP、FID、CLS、Resource Timing、Navigator 等浏览器 API。

开发环境要求 Node.js `>=24`，包管理器使用 pnpm `10.33.0`。构建目标保持 ES5，发布包保留 UMD、IIFE、ESM 和 `.mjs` 多格式产物。

基础版日志类型包括 `perf`、`except`、`dist`、`count`。增强版包含更多性能和异常采集模块并依赖浏览器能力；`spy-head` 负责全局 JS 错误、资源错误、白屏和部分早期性能观察。

## 运行与发送链路

```text
业务页面/跨端应用
  → SpyClient 参数、字段和采样处理
  → Image / Beacon / fetch 或自定义 request
  → rec-nginx 日志接入
  → 批处理或实时分析
```

公共字段通常包括 `pid`、`lid`、时间戳、类型、分组、`info` 和 `dim`。修改字段名、类型、采样语义、默认服务地址或请求方法时，要检查 Nginx 路由、protobuf 以及下游解析。

## 目录说明

```text
spy-client/
├── src/
│   ├── spy-client.ts          # 增强版入口
│   ├── spy-client-basic.ts    # 基础版入口和公共发送逻辑
│   ├── spy-head.ts            # 早期注入入口
│   ├── module/                # timing、LCP、FID、TTI、资源、LongTask 等
│   ├── head/                  # 错误、白屏、资源观察
│   ├── lib/                   # 数据、压缩、工具和接口
│   └── types/                 # 全局类型
├── test/e2e/                  # Playwright Test 测试
├── example/                   # 本地示例和缓存示例
├── rollup.config.mjs
├── playwright.config.ts
├── .oxlintrc.json
├── tsconfig.json
├── pnpm-lock.yaml
└── package.json
```

## 配置和产物

构建产物全部位于 `dist/`，包括基础版、增强版、`spy-head`、`spy-local-cache` 及其压缩文件和声明文件。`spy-client`、`spy-client-basic` 额外生成 IIFE、ESM 和 `.mjs` 格式。

## 开发命令

```bash
pnpm install
pnpm run lint
pnpm run test
pnpm run build
pnpm run dev
pnpm run watch
pnpm run example
```

`build` 是生产 Rollup 构建；`test` 使用 Playwright Test，并通过 `playwright.config.ts` 启动静态服务器和系统 Chrome；`lint` 使用 oxlint 检查 `src`；`example` 会启动开发构建和本地示例服务。

发布命令必须单独确认：

```bash
pnpm run release_pre
pnpm run release
pnpm run release_post
```

其中 `release_pre` 会重新构建、lint、测试；`release` 会修改版本并发布 npm；`release_post` 会推送分支和 tag，不得在普通验证中执行。

## 测试要求

修改公共发送逻辑时至少覆盖：

- 必填 `pid` 和非法字段。
- 四种日志类型。
- 全局采样和单条采样覆盖关系。
- `info`/`dim` 字段编码和边界。
- 浏览器发送成功、发送失败和自定义 request。
- 基础版与增强版运行时差异。

修改性能模块时检查对应浏览器 API 不可用的降级行为。增强版不得引入只适用于 Node.js 的全局假设。

## 常见问题

### 上报没有到达

检查实例参数、采样值、浏览器 Network、请求 URL、CORS/凭据、Nginx 路由和服务端日志。不能只看 SDK 是否调用成功。

### 指标为空或字段丢失

检查指标是否在正确的 `info`/`dim` 中、字段是否通过 SDK 校验、Nginx/Lua 是否截断，以及批处理/实时消费者是否支持新字段。

### Node.js/跨端加载异常

基础版需要按源码约定覆盖请求实现；增强版依赖浏览器 API。不能把 README 中“支持跨端”理解为所有构建产物都能在裸 Node.js 直接加载。

## 跨仓库约束

- SDK payload 变更必须检查 `rec-nginx/conf/proto/` 和 Lua。
- 日志类型变更必须检查批处理目录、实时同步副本和 Server 查询。
- 指标或维度变更要评估平台维度组合数和存储成本。
- README 中历史 CDN 版本、仓库地址和示例只作为线索，不能覆盖当前 package/source 事实。

## 安全边界

- 不在示例、测试和日志中写入 token、Cookie 或真实业务数据。
- 不将外部输入直接拼接 URL、查询参数或 HTML。
- 不使用生产服务做自动化压力测试。
- 采集字段可能包含 URL、错误堆栈和请求相关信息，新增字段需评估隐私与数据量。

## 验证清单

- [ ] `pnpm run lint`
- [ ] `pnpm run test`
- [ ] `pnpm run build`
- [ ] 检查 `dist/` 入口和声明文件
- [ ] 验证成功、采样为零、非法参数和 request 失败
- [ ] 检查下游日志协议兼容
- [ ] 不执行 npm/pnpm 发布和远端推送
