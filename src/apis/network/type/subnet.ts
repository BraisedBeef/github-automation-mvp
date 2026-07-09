export interface ContentPagination {
  pageIndex: number
  pageSize: number
}

export interface QuerySubnetPageQuery extends ContentPagination {
  regionId?: number // 地区ID
  zoneId?: number // 可用区ID
  vpcId?: number // 私网ID
  subnetId?: number // 子网ID
  subnetName?: string // 子网名称
  zoneIds?: string[]
}

export interface QuerySubnetDetailQuery {
  subnetId: number | string // 子网ID
}

export interface UpdateSubnetNameType {
  subnetId: number // 子网ID
  subnetName: string // 子网名称
}

export interface CreateSubnetType {
  zoneId: number // 可用区ID
  vpcId: number // VPCID
  rbId: number // 路由表ID
  subnetName: string // 子网名称
  cidrBlock: string //子网网段
}

export interface SubnetIpConfigType {
  regionId: number // 地区ID
}
