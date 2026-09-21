<!-- dsh-companion-architecture -->
# 代码架构与模块化规范（Agent 必读）

本插件由 dsh-mobile-plus（手机远程）与 dsh-done-pill（对话胶囊）合并而来。
两个模块**运行时互不感知**：统一入口只做装配，各模块独立 try/catch 挂载。

## 1. 目录与构建

- `src/host/index.js`：宿主统一入口（< 60 行），只做装配：`mp/index.js`（手机远程，
  透传 config）+ `pill-host.ts`（对话胶囊）。禁止塞业务逻辑。
- `src/host/mp/`：手机远程宿主源码（index + `lib/*.js` 17 个模块 + `qrcodegen.js`
  第三方 QR 库），**原样移植，改动保持最小**。
- `src/host/pill-host.ts`：对话胶囊宿主（TypeScript，由 esbuild 随包编译）。
- `src/client/index.ts`：浏览器统一入口：`pill`（胶囊）+ `mp-client`（手机入口）
  + `shell-hot`（壳子顶栏热区上报），单个模块失败不拖垮整体（`guarded`）。
- `src/client/mp-client.js`：手机入口（由原 client.js 经 `scripts/convert-mp-client.mjs`
  转换：去 loader 壳，`require('react')` → ESM import，导出 `applyMobileEntry`）。
  MP_CSS/文案/路由保持原样；`dataset.plugin` 仍为 `dsh-mobile-plus`（样式 tag 身份）。
- `src/client/pill.tsx` / `stores.ts` / `sidebar-card.tsx` / `shell-hot.ts`：对话胶囊。
- `src/client/status-orbit.tsx`：运行中笔画 + 状态色。移植自 dsh-notch 的原生
  `StatusOrbit.swift`：半径 9.5、1.5px 圆头线帽、占圆周 70%、角速度 2π/3 rad/s（一圈 3s）。
  **必须用 SVG 圆弧 + `stroke-dasharray`**，不能用 `conic-gradient`——上游观感是「一笔」，
  要有圆头端点才像。颜色常量对齐上游 `NotchTokens` / `StatusOutcome.rgb`，改前先核对。
- `src/client/idle-robot.tsx`：待机机器人——把 vendored OpenBotMotion 引擎挂进胶囊。
- `src/client/idle-director.ts`：待机动作调度**纯逻辑**（9 基础动作 + 稀有 dance，
  休息 5–10s、不重复上一个、reduced-motion 定格）。保持无 React 依赖，便于裸 node 单测
  （Node 不能 strip `.tsx`，所以策略必须留在 `.ts` 而不是组件文件里）。
- `src/vendor/open-bot-motion.js` / `idle-motions.js`：**生成物**，由
  `scripts/vendor-idle.mjs` 从 `tools/idle/*.js` 转成 ESM。上游是 UMD 包 + 浏览器
  `<script>`，都不能直接 import（UMD 会在 browser 包的工厂壳里走进 CommonJS 分支、
  冲掉本插件 exports）。**不要手改**；改上游后重跑 vendor 脚本。生成物随仓库提交，
  因为发布的包不带 `tools/`。
- `public/`：手机端 PWA（原生 ESM，见 `docs/mobile-plus-AGENTS.orig.md` 的目录规范），
  **构建不碰它**，运行时按包根相对路径提供服务。
- `lib/`：构建产物（`index.js` 宿主 + `client.js` 浏览器），**必须随仓库提交**
  （pnpm≥10 不跑 git 依赖的 prepare，安装方不构建）。host 不出 source map，
  client 保留 map（浏览器断点用）。

构建：`node build.mjs`（esbuild 在本目录或 DSH checkout 的 pnpm store 里找）。
构建内置 `assertHostExternals`：宿主 bundle 只允许 `node:` 内置模块，
出现任何外部包直接失败（已安装位置解析不到 @deepseek-ai/*，见 dsh-plugin-resolution）。

## 2. 路径约定（改前必读）

- `src/host/mp/lib/constants.js` 用 `import.meta` 算出 `<pkg>/public`：
  bundle 落在 `lib/index.js` 时结论不变（`lib` → 上一级 → 包根）。
  **不要**移动 `lib/index.js` 的输出位置，也不要移动 `public/`。
- 手机上传中转目录在**会话 cwd** 下（`.dsh-mobile-inbox`），与包位置无关。
- 配对设备数据在 DSH_HOME 下，与包位置无关。localStorage 键与路由前缀是公开契约，
  改名即 breaking change（见 README 迁移说明）。

## 3. 槽位与样式契约（稳定的有：id / 路由 / 本地名后缀）

- `sidebar.footer.action#dsh-mobile-plus`（手机图标，无 order → 0）、
  `sidebar.footer.action#dsh-done-pill-card`（小横条，order 10）、
  `shell.overlay#dsh-done-pill`、`settings.general.item` × 6。**id 不许改**。
- 底部两行布局靠 `sidebar-card.tsx` 的 `CARD_LAYOUT_CSS`（`:has()` 双锁注入式 CSS，
  只在宽栏 + 卡片挂载时生效）：footerActions 透明化后卡片与设置同取 `order:-1`
  （DOM 先后决胜），其他图标默认顺序跟在设置后。动它之前先读注释里的推导。
- CSS Module hash 前缀每次构建会变，注入式 CSS 只许用**本地名后缀**
  （`[class*="_footArea"]`）+ ARIA/自有类名（`.mp-trigger`、`[data-dpp-card]`）做钩子。
- **注入式 CSS 升级必须换表**：`ensurePillKeyframes()` 以前「标签已存在就早退」，
  插件升级后页面里那张旧 `<style>` 会活下来、新规则永远进不来——新增的动画会
  静默失效（元素照常渲染，只是不动，控制台零报错）。现在按 `PILL_CSS` 的内容指纹
  （`cssRevision()`）比对，不一致就删旧表重注入。**指纹必须惰性求值**：`PILL_CSS`
  声明在文件靠后，模块顶层求值会撞 TDZ 直接把整个 client bundle 打挂。
- mobile-plus 自带的 foot 并行规则（MP_CSS 里三条）**不许删**：卡片缺席时
  （悬浮形态）底部布局完全靠它，与合并前像素一致。
- 待机机器人只在**完全空闲**时挂载（无未读、无运行中任务）：它是唯一持续吃帧的元素。
  `.dpl-idle-bot`（悬浮，22px × `--dps`）与 `.dpp-idle-bot`（卡片 16px / rail 20px）
  由 PILL_CSS 定尺寸，`idle-robot.tsx` 负责把引擎过松的 viewBox 收窄到实测姿态边界，
  否则机器人在胶囊里小到看不清。机器人配色随主题（浅色炭黑身/白眼，深色暖白身/深眼），
  深色下固定炭黑会隐形。
- **两种形态（悬浮 / 卡片）都要有机器人与运行笔画**，且形态互斥渲染：改动后必须
  **分别**在两种模式下验证——同一次会话里只看得到其中一个。卡片有两个分支
  （wide 小横条 / rail 图标钮），每个分支都要处理「机器人 / 灯泡 / 笔画」三态。

## 4. 文件体积与提交规范

- mp 手写源（`src/host/mp/index.js` + `lib/*.js`）单文件 ≤300 行
 （`smoke-host.mjs` 强制执行，qrcodegen 第三方除外）；新增功能开新文件。
- `.gitattributes` 锁死 `lib/*.js` 换行 LF；不要加 `prepare` 脚本；不要忽略 `lib/`。
- `files` 只发运行时：`lib`、`public`、`scripts`（已安装位置冒烟用）、
  `build.mjs`、`cordis.patch.yml`、`README.md`、协议文件（含上游 MIT 许可证
  `LICENSE.open-bot-motion`）。`src/`、`tools/`、`tests/` 不发布但提交。
- 上游 vendored 代码的唯一 esbuild 警告（`duplicate-object-key`）已在构建里静音：
  第三方 MIT 文件按原样 vendored，不改它的内容。
<!-- /dsh-companion-architecture -->

# 运行宿主

本插件跟的是 DSH 宿主（跑 `dsh web` 的那台机器），不是对话所在的机器。

- 不要把某台机器的路径、IP、端口写进产品逻辑；`process.platform` 只分 win32 与 POSIX。
- 配对/二维码/cookie 相关改动同时想三条拓扑：本机 loopback、局域网、公网/云主机。
- 宿主半身不支持热重载：发版后提醒用户重启一次 DSH。
