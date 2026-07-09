export interface ListByRegionIdReq {
  regionId: number
}

export interface GetQuickCreateDefaultZoneReq {
  regionId: number
}

export interface CreateVpcReq {
  regionId: number
  // 地区ID

  zoneId: number
  // 子网可用区ID
}

export interface SendSSEReq {
  modeType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  // 模块类型1, "云服务器"2, "云硬盘",3, "镜像",4, "快照",5, "安全组",6, "SSH", 7, "VPC",8, "ENI",9, "EIP",
}
