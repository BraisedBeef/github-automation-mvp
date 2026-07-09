import { requestCd as request } from '@/request/http/index'

// 用户白名单菜单
export const _getUserCdnMenus = () => {
  return request({
    url: '/cdn/usermenus/list',
    method: 'get',
  })
}
