# dsh-mobile-plus

独立的 DSH 手机远程插件：在手机上连正在跑 `dsh web` 的那台宿主，发文字和文件。

界面为 iOS 风格：系统色板（浅色 systemGroupedBackground / 深色纯黑）、SF 字体、毛玻璃导航栏与输入条、
iMessage 实色蓝气泡、分组列表、底部大圆角抽屉、弹簧缓动与按压反馈；跟随 `data-theme` 明暗切换，尊重 `prefers-reduced-motion`。

宿主可以是 macOS / Windows / Linux 桌面，也可以是无 GUI 的云主机。不修改 `@linxin666/dsh-web-all`。

## 安装

```sh
dsh plugin --profile web add github:JackAIStudio/dsh-mobile-plus
```

装完后**重启 `dsh web`**，侧栏底部「设置」右侧才会出现手机远程图标。不要去杀正在跑的宿主进程；告诉正在用它的人，让他们自己重启。

## 配对

配对页只允许 **本机 loopback** 打开（`pair/issue` 同样）。这是安全边界，不是「只能在个人电脑上用」。

1. 桌面：点侧栏手机远程图标，或在这台宿主的浏览器打开 `http://127.0.0.1:<dsh端口>/mp/setup`。
2. 云主机：先 SSH 把 `dsh web` 端口打回你笔记本的 `127.0.0.1`，再打开上面的配对页。
3. 扫码或打开链接。一次性令牌（二维码 / 配对链接）**2 小时内有效**；任一端配对成功后另一条链接立刻失效。
4. 配对成功后，设备 cookie `mp_device` 有效期 **1 年**（每次打开 `/mp/` 会续期）。设备在服务端 **7 天无访问** 才会被忘掉。
5. 进入工作区 → 会话 → 聊天。回形针可传相册或文件（单文件 20MB，一次最多 5 个），文件落到该工作区的 `.dsh-mobile-inbox/`，会话里只带宿主上的真实路径。

未配置公网地址时，二维码只指向本机 `127.0.0.1`。手机要从公网连上，必须自己配 `publicBaseUrl`。

## 固定配对码（免扫码重连）

一次性令牌在**服务重启后就没了**：手机如果这时恰好掉了 cookie，配对页怎么输都是「无效」。配一枚长期固定配对码即可根治：

```yaml
- id: dsh-mobile-plus
  config:
    fixedPairCode: "8f2k1q"   # 4~64 位，字母数字与 . _ ~ -；也可用环境变量 DSH_MOBILE_PAIR_CODE
```

- 手机配对页输一次固定码，之后**自动记住**（localStorage）：重启服务、清 cookie、iOS 杀后台后，打开页面会静默重配，不再要求输入。
- 数据请求中途掉配对（403 unpaired）也会先拿记住的码静默重配一次再重试。
- 固定码配上的设备标记为「长期保留」，**不再被 7 天空闲清理淘汰**；setup 页仍可手动取消配对。
- 防爆破：同一来源 10 分钟内失败 10 次固定码即临时封 10 分钟（429）。请用 6 位以上、非生日号的码。
- setup 页（`/mp/setup`）会显示固定码，方便复制给新设备。

## 手机直开全量 Web 界面（grantWebSession）

dsh web 根路径 "/" 由每次启动随机更换的 launch token 把守：手机不扫码只会看到
`dsh web authentication required; reopen the URL printed by dsh web`。插件自己的 `/mp/` 不受它管，
但想在手机上看**完整 web 界面**就得每重启一次回电脑拿一次新 token。

打开 `grantWebSession` 后，**已完成插件配对的设备**顺带领一枚 29 天的 dsh web 会话 cookie
（用宿主 credentials 里持久化的签名密钥签发，与 launch token 换不换无关）：

```yaml
- id: dsh-mobile-plus
  config:
    grantWebSession: true
```

- 手机访问任意 `/mp/` 页面（PWA 打开、配对、状态轮询）自动签发 / 续期这枚 cookie；**服务重启不影响**。
- 书签入口用 `https://<你的地址>/mp/web`：已配对直接 302 进全量界面，未配对弹回配对页。
- 只有配对过的设备能领到；setup 页撤销设备后再开 `/mp/` 会把残留 web cookie 清掉（Max-Age=0）。
- 相当于把这台手机当第二块屏幕放行整宿主，与插件配对本身的信任级别一致；不想放就别开。

## 令牌推送到服务器（tokenPushUrl）

每次**服务启动**与每次**手动签发二维码**，插件都会把最新的一次性配对链接 POST 到你配的接收端，服务器永远留一份新 token：

```yaml
- id: dsh-mobile-plus
  config:
    tokenPushUrl: https://your-server.example.com/dsh-pair   # 也可用环境变量 DSH_MOBILE_PUSH_URL
    tokenPushHeaders:            # 接收端要认证就配头（如 nginx 基础认证）
      Authorization: "Basic xxxx"
```

请求体（JSON）：`{ type, reason: "startup"|"issue", url, localUrl, lanUrl, token, code, expiresAt, hostname, platform, pushedAt, hasFixedPairCode }`。
只推一次性令牌，**不会推固定码**。送达带 0/3/10/30 秒退避重试，失败只记 warn，不影响本机配对页。

## 公网地址

插件**不内置任何中转**。把你自己的域名、反代或云主机地址写进宿主配置：

```yaml
- id: dsh-mobile-plus
  config:
    publicBaseUrl: https://dsh.example.com
```

常见两种宿主：

| 宿主 | 配对页怎么开 | `publicBaseUrl` |
|---|---|---|
| 桌面 Mac / Windows | 本机浏览器直接开 loopback | 可选。要给 4G 手机用时，填你自己的反代 / 隧道 |
| 云主机 Linux | SSH 把端口打回 127.0.0.1 再开 | 填这台云自己的 HTTPS 域名。云上的 DSH 就是宿主，不必再套别人的中转 |

改配置或插件代码后需要重启 `dsh web`。

## 安全

配对成功的手机接近这台宿主上的 DSH：列目录、建工作区、读写会话、跑斜杠命令、上传文件、看账户额度。把它当成第二块屏幕，而不是「只能发一句聊天」。

- `setup` / `pair/issue` / `pair/stop` / `pair/revoke` 仅 loopback。
- 固定配对码是长期凭据：仅 trustedHost（loopback / 局域网 / `publicBaseUrl` 域）可尝试，带失败限流；公网务必保留反代认证。
- `tokenPushUrl` 的接收端会拿到一次性配对链接，请只配自己控制的地址并加认证头。
- 设备 cookie 和界面上的设备 id 分开；未配对的公网请求拿不到设备列表。
- 公网请走 HTTPS。不要把未加固的 `dsh web` 端口直接暴露到互联网。
- 额度接口只在宿主 loopback 上读 DeepSeek / Grok 插件，密钥不进手机。

## 0.1.2 适配说明（本 fork 相对上游的改动）

上游只到旧统一网关时代，在 0.1.2（无 apiProxy）上挂载即失败。
本 fork 的 host 半身已改调新服务，手机前端不动：

- 会话/工作区/模型/技能/预设：`ctx.sessionController` /
  `ctx.workspaceRegistry` / `ctx.sessionSkillCatalog` / `ctx.agentPresets`
 （经 `ctx.get` 拿，缺失即降级，不拖垮宿主；静态 `inject` 为空）。
- 历史：`sessionController.follow()` 开口快照当尾页，`page()` 翻页；
  打开手机会话会把该会话激活为 live（与桌面端打开会话一致）。
- 审批/问询：注册 `approval/request` / `user-questions/request` waterfall
  回答器。只有手机 5 分钟内碰过的会话才由手机接单，否则走桌面对话框。
- 会话标题：0.1.2 的 `sessionController.list` 只在投影缓存命中时才带标题，冷会话
  会缺，手机端于是回退显示目录名（看着像「标题变成了工作区」）。`lib/titles.js`
  用 `sessionQuery.readTitleSnapshots` 批量补齐当页缺的标题（不激活任何会话），
  结果缓存 2 分钟；实时 `session/title` 事件也顺手写缓存。
- 数据面（`/mp/api/*`、上传、SSE）默认必须已配对（`requirePairing`，
  关掉即开放局域网，公网不要关）。
- frp 这类 TCP 转发会让远端请求看起来像 loopback：配对页的 loopback
  限制在转发后面只剩 nginx 基础认证一道门，公网务必保留它。

## 许可证

[Apache License 2.0](./LICENSE)。二维码编码来自 [Nayuki qrcodegen](https://www.nayuki.io/page/qr-code-generator-library)（MIT），见 [NOTICE](./NOTICE)。
