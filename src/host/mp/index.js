/**
 * dsh-mobile-plus —— 手机远程独立插件（0.1.2 服务面）。
 * 路由全部自带 /mp 前缀，不碰其他插件。每个模块独立 try/catch 挂载。
 */
import { AuthManager } from './lib/auth.js'
import { LanBridge } from './lib/lan-bridge.js'
import { createPendingTracker, createFrameHub } from './lib/events.js'
import { createDispatcher } from './lib/rpc.js'
import { setupRoutes } from './lib/routes.js'
import { setupAnswerers } from './lib/answerers.js'

export const name = 'dsh-mobile-plus'
export const inject = []

function warn(ctx, message) {
  try { console.warn(message) } catch { /* 日志不可用也不炸 */ }
  void ctx
}

export function apply(ctx, config = {}) {
  if (config.enabled === false) return
  const auth = new AuthManager(config)
  const hub = createFrameHub()
  const tracker = createPendingTracker()
  const dispatch = createDispatcher(ctx, tracker)
  try { auth.setupWebSession(ctx.get('credentials')) } catch { /* 无 credentials 服务即不签发 web 会话 */ }
  try {
    const disposeAnswerers = setupAnswerers(ctx, tracker, hub.emit)
    ctx.effect(() => disposeAnswerers, 'dsh-mobile-plus: answerers')
  } catch (error) {
    warn(ctx, '[dsh-mobile-plus] 回答器挂载失败：' + String(error))
  }
  try {
    ctx.inject(['webServer'], (webCtx) => {
      let stop = undefined
      try {
        stop = setupRoutes(webCtx, auth, tracker, dispatch, hub)
      } catch (error) {
        warn(ctx, '[dsh-mobile-plus] 路由挂载失败：' + String(error))
      }
      return () => { if (stop) { try { stop() } catch { /* ignore */ } } }
    })
  } catch (error) {
    warn(ctx, '[dsh-mobile-plus] webServer 注入失败：' + String(error))
  }
  try {
    let port = 3080
    try {
      const found = ctx.get('webServer')?.port
      if (typeof found === 'number') port = found
    } catch { /* 用默认端口 */ }
    const bridge = new LanBridge(port, 3088)
    ctx.effect(() => {
      void bridge.start().then((boundPort) => { if (boundPort) auth.lanPort = boundPort })
      return () => bridge.stop()
    }, 'dsh-mobile-plus: lan bridge')
  } catch (error) {
    warn(ctx, '[dsh-mobile-plus] 局域网桥接挂载失败：' + String(error))
  }
  try {
    if (auth.pushUrl !== '') {
      ctx.effect(() => {
        const timer = setTimeout(() => { void auth.autoIssuePush(port) }, 2000)
        return () => clearTimeout(timer)
      }, 'dsh-mobile-plus: startup token push')
    }
  } catch (error) {
    warn(ctx, '[dsh-mobile-plus] 启动令牌推送挂载失败：' + String(error))
  }
}
