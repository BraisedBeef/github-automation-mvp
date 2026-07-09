export interface ContentPagination {
  pageIndex: number
  pageSize: number
}

export interface IpGroupListType extends ContentPagination {
  regionId: number //  区域id
  eipId?: string // 公网ID
  name?: string // 名称
  insId?: string // 实例ID
  stateList?: string[] // 状态集合
}

export interface CreateEipReq {
  regionId: number // 地区ID
  lineType: number // 线路类型 1 动态BGP
  chargeType: number // 计费类型 1 流量按小时计费(按需) 2 带宽包月(预付费)
  name: string // 名称
  size: number // 带宽大小
  num: number // 带宽数量
  period?: number // 包年包月时长 可选  按月
  autoRenewFlag?: number // 自动续费标识  可选  1 手动续费 2 自动续费
}

export interface BatchReleaseEipReq {
  idList: string[] // 公网id列表
}

export interface BatchUpdateEipReq {
  eipIds: string[] | number[] // 公网id
  chargeType: number // 计费模式  1 流量按小时计费(按需) 2 带宽包月(预付费)
  maxBandwidth: number // 带宽
  period?: number // 包月时长(月)
  autoRenewFlag?: number // 自动续费标识 1 手动续费 2 自动续费
}

export interface QueryBindResourceListReq {
  regionId: string // 地域ID
  resourceType: number // 资源类型 1 服务器 2网卡
  insId: string // 实例ID
  insName: string // 实例名称
  eniId: string // 弹性网卡ID
  eniName: string // 弹性网卡名称
}

export interface GetDefaultConfigReq {
  regionId: string | number // 地域id
}

export interface GetEipDetailReq {
  eipId: string | number // 公网id
}

export interface AssociateEipReq {
  eipId: string | number // 公网id
  instanceType: number // 绑定实例类型 1 服务器 2 弹性网卡
  insId?: string | number // 实例ID  可选 实例与网卡二选一
  eniId?: string | number // 网卡ID  可选  仅传网卡ID时绑定网卡主IP
  privateIpId?: string // 内网IPID 可选 传网卡ID+内网ID时可指定内网IP绑定
}

export interface QueryInsBindEipListReq extends ContentPagination {
  insId?: string | number // 实例ID 二选一
  eniId?: string | number // 网卡ID 二选一
}

export interface RenewEipReq {
  eipId: string // 弹性公网IPID
  period: number // 包年包月时长 按月
  autoRenewFlag: number // 自动续费标识 1 手动续费 2 自动续费
}

export interface QueryEipPriceReq {
  regionId: string // 地区ID
  chargeType: number // 计费类型 1 流量按小时计费 2 带宽包月
  size: number // 带宽大小 带宽计费时指定
  period: number // 购买时长(月)
  num: number // 数量
}

export interface QueryUpdateBandwidthPriceReq {
  eipId: string // 网卡ID
  size: number // 带宽大小
}

export interface QueryRefundEipPricerReq {
  eipIdList: string | number[] // 弹性公网IPID
}

export interface GetEipLineTypeReq {
  regionId: string | number
  chargeType: number
}

export interface UpdateEipNameReq {
  id: number
  name: string
}

// 查询地区下支持的EIP计费模式
export interface GetEipChargeTypeReq {
  regionId: string | number
}

export interface RecycleBinEipPageReq extends ContentPagination {
  regionId: number //  区域id
  eipId?: string // 公网ID
  name?: string // 名称
  insId?: string // 实例ID
  stateList?: string[] // 状态集合
}

export type GetEipIdByInstanceIdReq = number[]
