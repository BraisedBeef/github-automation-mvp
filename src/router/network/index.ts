import { viewPrivateNetworkRoutes } from './private-network'
import { viewSubnetRoutes } from './subnet'
import { viewRouteTableRoutes } from './route-table'
import { viewPublicIpRoutes } from './public-ip'
import { viewNetworkCardRoutes } from './network-card'
import { viewSecurityGroupRoutes } from './security-group'
import { viewIpGroupRoutes } from './ip-group'
import { viewOrderRoutes } from './order'
import { viewRefundRoutes } from './refund'
import { viewFlowPacketRoutes } from './flow-packet'
import { viewRecoveryRoutes } from './recovery'

export const networkRoutes = [
  ...viewPrivateNetworkRoutes, // 私有网络
  ...viewSubnetRoutes, // 子网
  ...viewRouteTableRoutes, // 路由表
  ...viewPublicIpRoutes, // 弹性公网IP
  ...viewNetworkCardRoutes, // 弹性网卡
  ...viewSecurityGroupRoutes, // 安全组
  ...viewIpGroupRoutes, // IP组
  ...viewOrderRoutes, // 订单
  ...viewRefundRoutes, //退款
  ...viewFlowPacketRoutes, // 共享流量包
  ...viewRecoveryRoutes, // 回收站
]
