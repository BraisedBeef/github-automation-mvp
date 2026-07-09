import { useBaseStore } from '@/store'
import { OperationalModule } from '@/store/interface'
import { BusinessType } from './use-product-order'
import { pushRoute } from '@/utils/router-jump'

/**
 * @desc 支付成功页面跳转
 */
export const usePaymentRouteJump = () => {
  const route = useRoute()
  const baseStore = useBaseStore()

  // 跳转控制台对应模块
  const go = async () => {
    console.log(`query===>`, route.query.type)
    const type = route.query.type as BusinessType
    // 充值业务
    if (type === 'recharge') {
      handleTo('/cost', 'cost_center_account')
    } else if (type === 'cdn') {
      // cdn业务
      handleTo('/cdn', 'cdn_analysis_monitor')
    } else if (type === 'order') {
      // order业务
      handleTo('/cost', 'order')
    } else if (type === 'cvm') {
      // cvm业务
      handleTo('/cvm', 'ins')
    } else if (type === 'cbs') {
      // cbs(硬盘)业务
      handleTo('/cvm', 'disk')
    } else if (type === 'eip') {
      // eip业务
      handleTo('/network', 'network_security_public_ip_list', true)
    } else if (type === 'flow_packet') {
      handleTo('/network', 'network_security_flow-packet_list', true)
    } else if (type === 'domain') {
      // 域名买卖
      handleTo('/domain', 'domain_overview')
    } else if (type === 'renew') {
      // 续费业务
      handleTo('/cost', 'renew')
    } else if (type === 'oss') {
      handleTo('/oss', 'bucket')
    } else {
      // 未传 统一跳转到首页
      handleTo('/home', '')
    }
  }

  /**
   * @name 处理跳转逻辑，并同步让侧边栏更新
   * @param routeModel 路由模块
   * @param name 跳转路由名称
   * @param refreshLoading 跳转后是否loading刷新
   */
  const handleTo = (routeModel: OperationalModule, name: string, refreshLoading: boolean = false) => {
    // baseStore.routeModel = routeModel
    // baseStore.selectedKeys = name
    pushRoute({
      name,
      query: { refreshLoading: refreshLoading ? '1' : '0' },
    })
  }

  return {
    go,
    handleTo,
  }
}
