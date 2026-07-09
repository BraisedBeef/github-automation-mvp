import { viewAccountRoutes as viewAccountSystemAccountRoutes } from './account'
import { viewAccessRoutes } from './access'
import { viewSecuritySettingRoutes } from './security-setting'
import { viewNewsRoutes } from './news'

export const userRoutes = [
  ...viewAccountSystemAccountRoutes, // 账号信息
  ...viewAccessRoutes, // 访问管理
  ...viewSecuritySettingRoutes, // 安全设置
  ...viewNewsRoutes, //  消息订阅
] // 用户系统
