import { purchaseRoutes } from './purchase'
import { managementRoutes } from './management'
import { hostingRoutes } from './hosting'
import { dnsQuickRoutes } from './dns'

export const sslRoutes: PlusRouteRecordRaw[] = [
  ...managementRoutes,
  ...purchaseRoutes,
  ...hostingRoutes,
  ...dnsQuickRoutes,
]
