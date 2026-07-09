// import { domain as axios } from "..";
import { requestCd as request } from '@/request/http/index'

// 获取分组列表
export const _getGroupList = () => {
  return request.get('/dns/group/list')
}

// 新增/修改分组
export const _changeGroup = (data: { groupId?: number; name: string }) => {
  return request.post('/dns/group/operate', data)
}

// 变更域名分组
export const _changeDomainGroup = (data: { domainId: string; groupId: number }) => {
  return request.post('/dns/domain/group/modify', data)
}

// 删除分组
export const _deleteGroup = (data: { groupId: number }) => {
  return request.post('/dns/group/del', data)
}
