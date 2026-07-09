import { viewInsRoutes } from './ins'
import { viewSnapshotRoutes } from './snapshot'
import { viewImageRoutes } from './image'
import { viewDiskRoutes } from './disk'
import { viewRecoveryRoutes } from './recovery'
import { viewSSHKeykRoutes } from './ssh-key'
import { viewRefundRoutes } from './refund'
import { viewPublicIpQuickRoutes } from './public-ip'

export const cvmRoutes = [
  ...viewInsRoutes, // 实例
  ...viewSnapshotRoutes, // 快照
  ...viewDiskRoutes, //  镜像
  ...viewImageRoutes, //  硬盘
  ...viewPublicIpQuickRoutes, // 弹性公网IP快捷方式
  ...viewSSHKeykRoutes, //  ssh key
  ...viewRecoveryRoutes, // 回收站
  ...viewRefundRoutes, // 退款
]
