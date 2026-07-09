// utils/router.ts
import router from '@/router'
import type { RouteLocationRaw } from 'vue-router'

type NavTarget = RouteLocationRaw

/**
 * push 跳转（会新增 history）
 */
export const pushRoute = (to: NavTarget) => {
  return router.push(to)
}

/**
 * replace 跳转（替换当前 history）
 */
export const replaceRoute = (to: NavTarget) => {
  return router.replace(to)
}

/**
 * go（可前进/后退）
 */
export const goRoute = (delta: number) => {
  return router.go(delta)
}

/**
 * 返回
 */
export const backRoute = () => {
  return router.back()
}

/**
 * 前进
 */
export const forwardRoute = () => {
  return router.forward()
}
