export interface GetShareTrafficPackageConfigListType {
  regionId: number // 地区ID
  lineType: string // 线路类型 1 动态BGP 2 猫云大陆bpg 3 猫云大陆精品bgp 4 猫云大陆优化bpg
}

export interface CreateShareTrafficPackageType {
  regionId: number // 地区ID
  configId: number // 流量包配置编号
  num: number //带宽数量
}

export interface ShareTrafficPackageListType {
  pageIndex: number // 页码
  pageSize: number //  每页大小
  id?: number // ID
  regionId: number // 地区ID
  lineType?: number // 公网IP线路类型 1 动态BGP 2 猫云大陆bpg 3 猫云大陆精品bgp 4 猫云大陆优化bpg
  stateList?: number[] // 状态 1 正常 2 使用完毕 3 过期 4 已失效
}

export interface GetShareTrafficPackageDetailType {
  id: number | string
}

export interface SetShareTrafficPackageNameType {
  id: number | string
  name: string // 流量包名称
}

export interface PageEipAllowedShareTrafficPackageType {
  pageIndex: number // 页码
  pageSize: number //  每页大小
  pkgId: number // 共享流量包ID
  eipUuid?: number | string // EIP资源ID
  eipName?: string // EIP名称
}

export interface ShareTrafficPackageConfigDetailType {
  id: number | string // id
}

export interface ShareTrafficPackageEipListType {
  pageIndex: number // 页码
  pageSize: number //  每页大小
  pkgId: number | string // 共享流量包ID
  eipUuid?: number | string // EIP资源ID
  eipName?: string // EIP名称
}

export interface ShareTrafficPackageRemoveEipType {
  pkgId: number | string // 共享流量包ID
  eipIds: number[] // EIP ID
}
