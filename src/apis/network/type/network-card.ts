export interface ContentPagination {
  pageIndex: number
  pageSize: number
}

export interface EniPageReq extends ContentPagination {
  regionId: number // 地域ID
  eniId?: string // 弹性网卡ID
}

export interface EniDetailReq {
  eniId: string | number // 弹性网卡ID
}

export interface CreateEniReq {
  regionId?: number // 地区ID
  zoneId: number | string // 可用区ID
  name: string // 网卡名称
  vpcId: number | string // VPCID
  subnetId: number | string // 子网ID
  securityGroupId: number | string // 安全组ID
  primaryIpType: number // 主IP分配方式  1 自动 2 手动
  primaryIp?: string // 主IP 可选 自动分配可不传
  insId?: string
}

export interface DeleteEniReq {
  eniIds: string | string[] // 弹性网卡ID
}

export interface EniPrivateIpListReq {
  eniId: string // 弹性网卡ID
}

export interface EniUpdateSgReq {
  eniId?: string | number // 弹性网卡ID
  sgIds: string[] | number[] // 安全组编号列表
}

export interface UpdateEniReq {
  eniId: string // 网卡ID
  eniName: string // 网卡名称
}

export interface AddIpReq {
  eniId: string // 网卡ID
  ipList: {
    type: number // IP分配类型  1 自动分配 2 手动分配
    ip: string // ip
  }[]
}

export interface DelIpReq {
  eniId: string // 网卡ID
  privateIpId: string | number // 内网IPID
}

export interface UpdateIpReq {
  eniId: string // 网卡ID
  privateIpId: string // 内网IPID
  remark: string // 备注
}

export interface EniBindVmReq {
  insId: string | number // 实例ID
  eniId: string | number // 网卡ID
}

export interface InsBindEniListReq {
  insId: string | number // 实例ID
  eniId?: string // 网卡ID
  eniUuid?: string // 网卡uuid
  eniName?: string // 网卡名称
}
