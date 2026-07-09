import { Pagination } from '@/apis/account-system/access/strategy/type'

export interface ComputeDiskPriceReq {
  regionId: number //地区id
  priceId: number | string //价格id
  costType: number //实例计费类型 (1 按量计费 2 包年包月)
  size: number //大小(GB)
  duration?: number | string //时长 月
  diskCount?: number //创建云硬盘数量
  operationType: number // 1创建5续费6扩容
  id?: number
}

export interface CreateDiskReq {
  regionId: number //地区id
  priceId: number //价格id
  costType: number //实例计费类型(1 按量计费 2 包年包月)
  size: string //大小(GB)
  duration: number //时长 月
  diskCount: number //创建云硬盘数量
  lineId?: number //线路ID
  zoneId: number //可用区ID
  snapshotId: string //快照ID 可选
  renewFlag: number //自动续费标识( 1 自动续费 2 不自动续费)
  totalPrice: number //总价格
  diskName: string //硬盘名称
}

export interface AttachDiskReq {
  ids: number[] // 硬盘id
  instanceId: number // 实例id
}

export interface DetachDiskReq {
  ids: number[] // 硬盘id
}

export interface ModifyRenewFlagReq {
  id: number //硬盘id
  renewFlag: number //自动续费标识( 1 自动续费 2 不自动续费)
}

export interface AssignToProjectReq {
  id: string // 硬盘id
  projectId: number // 项目id
}

export interface ResizeDiskReq {
  id: string // 厂商硬盘id
  diskSize: number // 扩容大小
  regionId?: number // 区域id
}

export interface RenewDiskReq {
  id: string //厂商硬盘id
  duration: number //购买云盘的时长，默认单位为月，取值范围：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 36
  totalPrice: number // 总价格
}

export interface TerminateDisksReq {
  ids: string[] // 硬盘id
}

export interface ListDiskReq extends Pagination {
  diskId?: number
  // 硬盘id

  diskTypeName?: string
  // 硬盘类型名称

  vendor?: number
  // 1腾讯2华为

  costType?: number
  // 计费模式

  typeList?: number[]
  // 硬盘类型（1 系统盘 2 数据盘)

  zoneId?: number
  // 可用区id

  regionId?: number
  // 地域id

  states?: number[]
  // 云盘状态 (1创建中 2 运行中 3 扩容中 4 续费中 5挂载中 6已挂载 7卸载中 8退还中 9已过期 10待回收 11恢复中 12销毁中 13快照回滚中 14冻结 15创建快照中 99已销毁)

  condition?: string
}

export interface GetDetailReq {
  id: string
}

export interface ListDiskPriceReq {
  costType?: number
  // 实例计费类型(1 按量计费 2 包年包月)

  regionId: number
  // 地区id

  specificationId?: number
  // 服务器规格ID 新建服务器创建云硬盘时，必须传入，不传可能导致创建服务器失败

  zoneId?: number
  // 可用区ID 新建服务器创建云硬盘时，必须传入，不传可能导致创建服务器失败

  diskId?: number
}

export interface UpdateDiskReq {
  regionId?: number
  // 地区id

  priceId?: number
  // 价格id

  costType?: number
  // 实例计费类型(1 按量计费 2 包年包月)

  size?: string
  // 大小(GB)

  duration?: number
  // 时长 月

  diskCount?: number
  // 创建云硬盘数量

  lineId?: number
  // 线路ID

  zoneId?: number
  // 可用区ID

  snapshotId?: string
  // 快照ID

  renewFlag?: number
  // 自动续费标识( 1 自动续费 2 不自动续费)

  totalPrice?: number
  // 总价格

  diskName?: string
  // 硬盘名称

  id: number
}

export interface OperateLogListReq extends Pagination {
  resourceId: number
  // 资源id

  operateType: number
  // 日志类型1实例2镜像3安全组4子网5私有网络6弹性公网ip7弹性网卡8硬盘9快照

  startTime: string
  // 开始时间

  endTime: string
  // 结束时间
}

export interface DiskConvertOnDemandToSubscriptionReq {
  id: string
  // 硬盘id

  duration: number
  // 购买云盘的时长，默认单位为月，取值范围：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 36。

  renewFlag: number
  // 1 自动续费0 不自动续费
}
