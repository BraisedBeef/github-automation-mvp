export interface QuerySubnetPageType {
  id?: number // 子网ID
  subnetUuid?: string // 子网唯一标识
  subnetName?: string // 子网名称
  vpcId?: number // vpcID
  vpcUuid?: string // vpc唯一ID
  vpcName?: string // vpc名称
  cidrBlock?: string // 网段
  zoneId?: number // 可用区ID
  zoneName?: string // 可用区名称
  rbId?: number // 路由表ID
  rbUuid?: string // 路由表唯一ID
  rbName?: string // 路由表名称
  isDefault?: number // 默认子网 1 默认子网 2 非默认子网
  usableIpCount?: number // 可用IPV4个数
  totalIpCount?: number // 子网IPV4总数
  insNum?: number // 服务器个数
  createTime?: number // 创建时间
}

export interface AddFormType {
  zoneId: number | string
  vpcId: number | string
  rbId: number | string
  subnetName: string
  cidrBlock: string
  ipv4One: string
  ipv4Two: string
  ipv4Three: string
  ipv4Four: string
  port: number | string
}
