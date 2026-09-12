/**
 * dsh-companion — 统一宿主入口。
 *
 * 由 dsh-mobile-plus（手机远程）与 dsh-done-pill（对话完成胶囊）合并而来：
 * 两个模块各自独立挂载、互不干扰（各模块内部已有 try/catch，这里再包一层，
 * 任一模块装配失败不拖垮另一个）。
 *
 * 路由/事件口径与合并前完全一致（零迁移成本）：
 *  - 手机远程：/mp/*（配对、API、静态手机页），answerers 订阅 approval/request
 *    与 user-questions/request，局域网桥接，启动令牌推送；
 *  - 对话胶囊：全局 session/event 监听，GET /api/dsh-done-pill，
 *    壳子顶栏热区 POST /api/dsh-done-pill/shell-hot。
 */
import { apply as applyMobile } from './mp/index.js'
import { applyDonePill } from './pill-host.js'

export const name = 'dsh-companion'
/** done-pill 需要 webServer（路由注册）；mobile-plus 全程懒取，缺服务自动降级。 */
export const inject = ['webServer']

function warn(ctx, message) {
  try {
    if (typeof ctx.logger?.warn === 'function') ctx.logger.warn(message)
    else console.warn(message)
  } catch { /* 日志不可用也不炸 */ }
}

/** 装配手机远程 + 对话胶囊（host 半身）。config 透传给手机远程（配对公网入口等）。 */
export function apply(ctx, config = {}) {
  try {
    applyMobile(ctx, config)
  } catch (error) {
    warn(ctx, '[dsh-companion] 手机远程挂载失败：' + String(error))
  }
  try {
    applyDonePill(ctx)
  } catch (error) {
    warn(ctx, '[dsh-companion] 对话胶囊挂载失败：' + String(error))
  }
}
