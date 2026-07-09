import { viewPublicIpRoutes } from '../../network/public-ip'
import { _deepClone } from '@/utils/collection-utils'

// 弹性公网IP视图路由（快捷）
const routes = _deepClone(viewPublicIpRoutes)
routes[0].meta.rightIcon = 'storage-link'

export const viewPublicIpQuickRoutes = routes
