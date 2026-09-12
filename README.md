# dsh-companion — 手机远程 + 对话胶囊（二合一）

DSH 伴侣插件，由 `dsh-mobile-plus`（v0.8.0）与 `dsh-done-pill`（v0.7.3）
合并而来：**一次安装，两个能力**，同槽位布局在同一个仓库里一次调平，
以后再也不会出现两个插件互相挤布局的问题。原仓库已删除，以这个仓库为准。

**全程零 DSH 源码改动。**

## 安装

```bash
# 先卸旧的（remove 和 add 必须分两轮执行，不要写进同一条命令）
dsh plugin --profile web remove dsh-mobile-plus
dsh plugin --profile web remove dsh-done-pill
dsh plugin --profile web add github:Kr-ATG/dsh-companion
```

**装完重启一次 DSH**（宿主半身不支持热重载，新路由重启后才生效）。

## 功能一：手机远程

手机扫码配对后远程聊（文字 + 文件传输），侧边栏底部手机图标进入。

- 配对：扫码 / 6 位配对码 / 固定配对码（长期有效，见下方配置）；
- 双通道二维码：公网远程 + 局域网极速，客户端一键切换；
- 手机端是完整的 PWA（`public/`）：会话、文件、审批、额度、离线缓存；
- 路由全部自带 `/mp` 前缀：`/mp`、`/mp/setup`、`/mp/pair/*`、`/mp/api/*`。

配置（`cordis.patch.yml` 的 config 段，或同名 `DSH_MOBILE_*` 环境变量）：

| 键 | 说明 |
|---|---|
| `publicBaseUrl` | 公网入口（如 `https://dsh.example.com`），二维码指向它；没有公网就删掉这行，只用局域网 |
| `fixedPairCode` | 固定配对码（4~64 位），手机输一次自动记住，重启/掉线静默重配 |
| `tokenPushUrl` / `tokenPushHeaders` | 签发后把一次性配对链接 POST 到接收端（ntfy 等） |
| `grantWebSession` | 已配对手机自动领 web 会话 cookie，全量界面免扫码（入口 `/mp/web`），默认关 |

## 功能二：对话完成胶囊

任一会话（含后台会话）回合完成时提醒、点击跳会话、悬停看全文。

- **两种形态**（设置 → 胶囊形态，二选一，实时切换）：
  - **卡片**：左下角设置上方的小横条，摘要展示进行中/完成数；悬停（触屏点按）在卡片上方弹出「进行中 + 最近完成」面板；侧边栏收起时退化为带数标徽的图标钮；
  - **悬浮**：顶部可拖拽浮窗（位置持久化），悬停滑出记录全文；
- 附带健康提醒（休息时段 / 凌晨）与外观设置（大小 65%–160% / 8 种字体），两种形态共用；
- 布局一次调平：卡片独占首行，手机图标留在设置行右侧原位（`:has()` 双锁注入式 CSS，悬浮形态下自动失效）。

## 自测

```bash
node build.mjs              # 构建 lib/index.js（宿主）+ lib/client.js（浏览器）
node scripts/smoke-host.mjs # 宿主：路由/事件/403/零外部依赖/行数规范
node scripts/smoke-client.mjs # 浏览器：9 个槽位注册 + 只依赖 react 系
```

构建产物 `lib/` 随仓库提交（pnpm≥10 不跑 git 依赖的构建脚本，装完即用）；
`public/`（手机页静态资源）必须留在包根目录（`files` 已含）。

## 迁移说明（从旧两插件过来）

- 路由（`/mp/*`、`/api/dsh-done-pill*`）、槽位 id、localStorage 键**全部不变**：
  已读态、胶囊形态/大小/字体设置、手机配对设备（存在 DSH_HOME 下）无缝延续；
- 旧插件卸载前，两边的功能保持原样；先 `remove` 旧的再 `add` 新的，避免
  `sidebar.footer.action#dsh-mobile-plus` 这类槽位 id 短暂重复注册抛错。

## 来源与许可

- 手机远程部分源自 `dsh-mobile-plus`（Apache-2.0，见 `LICENSE`、`NOTICE`；
  配对面板移植自 `@linxin666/dsh-web-all` 的远程访问页；QR 库为 Nayuki/MIT，见源码头）；
- 对话胶囊部分源自 `dsh-done-pill`（MIT，见 `LICENSE-MIT`；最早移植自 dsh-webui 的 done-pill）。
