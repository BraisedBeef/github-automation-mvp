import { Pagination } from '@/apis/account-system/access/strategy/type'

export interface CreateSnapshotReq {
  diskId: string // 硬盘id
  name: string // 快照名称
  regionId: number // 区域id
}

export interface RollbackSnapshotReq {
  id: string // 快照id
  autoStopInstance: number
}

export interface DeleteSnapshotReq {
  ids: string[]
  // 快照id
}

export interface GetSnapshotListReq extends Pagination {
  states?: number[]
  diskId?: number | string // 硬盘id
  regionId?: number // 区域id
  condition?: string
  diskType: number
  diskTypeId: number
}

export interface GetDetailReq {
  id: string
}

export interface ListSnapshotPolicyReq extends Pagination {
  condition?: string
}

export interface SaveSnapshotPolicyReq {
  id: number

  name: string
  // 定期快照策略名

  type: number
  // 定期快照类型：1:按周，2:按月，3:按天

  hour: number[]
  // 指定定期快照策略的触发时间，单位为小时，取值范围：[0, 23]

  dayOfWeek?: number[]
  // 指定每周触发定期快照的日期，取值范围：[0, 6]

  dayOfMonth?: number[]
  // 指定每月触发定期快照的日期，取值范围：[1, 31]

  intervalDays?: number
  // 指定创建定期快照的间隔天数，取值范围：[1, 365]

  reserveDay: number
  // 保留天数
}

export interface BindSnapshotPolicyReq {
  id: number
  // 策略id

  diskIds: number[]
  // 硬盘id
}

export interface DeleteSnapshotPolicyReq {
  ids: number[]
  // 策略id
}
