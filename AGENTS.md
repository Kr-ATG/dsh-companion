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
- mobile-plus 自带的 foot 并行规则（MP_CSS 里三条）**不许删**：卡片缺席时
  （悬浮形态）底部布局完全靠它，与合并前像素一致。

## 4. 文件体积与提交规范

- mp 手写源（`src/host/mp/index.js` + `lib/*.js`）单文件 ≤300 行
 （`smoke-host.mjs` 强制执行，qrcodegen 第三方除外）；新增功能开新文件。
- `.gitattributes` 锁死 `lib/*.js` 换行 LF；不要加 `prepare` 脚本；不要忽略 `lib/`。
- `files` 只发运行时：`lib`、`public`、`scripts`（已安装位置冒烟用）、
  `build.mjs`、`cordis.patch.yml`、`README.md`、协议文件。`src/` 不发布但提交。
<!-- /dsh-companion-architecture -->

# 运行宿主

本插件跟的是 DSH 宿主（跑 `dsh web` 的那台机器），不是对话所在的机器。

- 不要把某台机器的路径、IP、端口写进产品逻辑；`process.platform` 只分 win32 与 POSIX。
- 配对/二维码/cookie 相关改动同时想三条拓扑：本机 loopback、局域网、公网/云主机。
- 宿主半身不支持热重载：发版后提醒用户重启一次 DSH。
