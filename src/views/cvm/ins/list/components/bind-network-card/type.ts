export interface Form {
  regionId: number // 地区ID
  zoneId: number // 可用区ID
  name: string // 网卡名称
  vpcId: string | number // VPCID
  subnetId: string | number // 子网ID
  securityGroupId: string | number // 安全组ID
  primaryIpType: number // 主IP分配方式 1 自动 2 手动
  primaryIp?: string // 主IP
}
