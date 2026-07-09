export interface ContentPagination {
  pageIndex: number
  pageSize: number
}

export interface IpGroupListType {
  regionId: number
}

export interface AddIpGroupType {
  name: string // IP地址组名称
  description: string // 备注
  regionId: number // 区域id
  etherType: string // IP地址类型 IPv4 IPv6
  ipExtraSet: { ip: string; /* ip地址 */ remarks: string /* IP地址备注 */ }[] // ip地址集合
}

export interface DeleteIpGroupType {
  regionId: number // 区域id
  ids: number[] // ip组id
}

export interface IpListType {
  id: number | string // ip组绑定的ip的id  如果是新增的就不填
  ip: string // ip地址
  description: string // 描述
}

export interface UpdateIpGroupType {
  id: string
  name: string // IP组名称
  description: string // 描述
  ipList: IpListType[]
}

export interface IpListSecurityGroupType {
  id: number // ip地址组id
  regionId: number // 区域id
}
