/**
 * dsh-companion — 统一客户端入口。
 *
 * 由 dsh-mobile-plus（手机远程入口）与 dsh-done-pill（对话胶囊：顶部悬浮 +
 * 左下角小横条卡片 + 设置行）合并而来：两个模块各自独立注册槽位、互不干扰
 * （单个模块失败不拖垮整体）。
 *
 * 注册总览：
 *  - sidebar.footer.action#dsh-mobile-plus（手机远程图标，见 ./mp-client.js）
 *  - shell.overlay#dsh-done-pill（顶部悬浮胶囊，见 ./pill.tsx）
 *  - sidebar.footer.action#dsh-done-pill-card（左下角小横条卡片，见 ./sidebar-card.tsx）
 *  - settings.general.item × 6（胶囊形态 / 显隐 / 提醒 ×2 / 尺寸 / 字体）
 *
 * 服务依赖：只有 slots 是硬依赖；sessions（点击跳会话）在各模块内懒取。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { applyDonePill } from './pill'
import { applyMobileEntry } from './mp-client'
import { startShellHotReporter } from './shell-hot'

/** 顶层服务依赖（client boot graph 用）。 */
export const inject = ['slots']

/** 单个模块失败不拖垮插件整体。 */
function guarded(ctx: ClientContext, label: string, mount: () => void): void {
  try {
    mount()
  } catch (error) {
    console.warn(`[dsh-companion] ${label} 挂载失败：${error instanceof Error ? error.message : String(error)}`)
  }
}

export function apply(ctx: ClientContext): void {
  guarded(ctx, 'done pill', () => applyDonePill(ctx))
  guarded(ctx, 'mobile entry', () => applyMobileEntry(ctx))
  // 壳子顶栏热区让位上报器（对话胶囊用；独立于挂载结果）。
  guarded(ctx, 'shell hot reporter', () => { startShellHotReporter() })
}
