// import { sys as axios } from "..";
import { requestCd as request } from '@/request/http/index'

// 获取域名解析类型列表
export const _getAnalysisTypeList = () => {
  return request.get('/sys/dnstype_list')
}

// 获取监控服务器ip列表
export const _getIPList = () => {
  return request.get('/sys/monitor/serverIps')
}

// 获取线路列表
export const _getLineTypes = () => {
  return request.get('/sys/dnslines_list')
}

// 获取系统配置项参数
export const _getCommonData = () => {
  return request.get('/sys/getSystemConfigParam')
  // return request.get('/getSystemConfigParam')
}
