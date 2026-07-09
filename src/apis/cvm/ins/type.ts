import { Pagination } from '@/apis/account-system/access/strategy/type'

export interface CreateInstanceReq {
  [x: string]: any
}

export interface BatchRebootServersReq {
  regionId: number

  serverIds: string[] // 服务器ID集合

  type: string // 重启类型 SOFT：表示软关机 HARD：表示硬关机
}

export interface BatchStopServersReq {
  regionId: number | string

  serverIds: string[] // 服务器ID集合

  type: string // 重启类型 SOFT：表示软关机 HARD：表示硬关机
}

export interface BatchStartServersReq {
  regionId: number

  serverIds: string[] // 服务器ID集合
}

export interface BatchSetPwdReq {
  regionId: number

  serverIds: string[]
  // 服务器ID集合

  pwd: string
  // 服务器密码

  isAutoReboot: boolean
  // 是否自动重启
}

export interface UpdateInstanceNameReq {
  serverIds: string[]
  // 服务器ID

  instanceName?: string
  // 服务器名称

  description?: string
  // 服务器描述信息

  projectId?: number
  // 服务器项目ID
}

export interface ResetInstanceImageReq {
  serverId: number
  // 服务器ID

  isAutoStop: boolean
  // 是否自动关机

  pwd: string
  // 服务器密码
}

export interface ChangeServerOsReq {
  serverId: number
  // 服务器ID

  isAutoStop: boolean
  //是否自动关机

  pwd?: string
  // 服务器密码

  keyId: number
  // 服务器秘钥keyId

  imageType: number
  // 镜像类型 1 公共镜像 2 私有镜像

  imageId: number
  // 镜像ID
}

export interface ChangeServerTypeReq {
  serverId: number
  //服务器ID

  isAutoStop: boolean
  //是否自动关机

  instanceTypeId: number
  //实例规格ID

  createPreRefundOrde?: boolean
  // true=>创建预付订单 false=>退款
}

export interface ListInstanceReq {
  pageIndex: number

  pageSize: number

  regionId: string | number

  zoneIds?: number[]

  instanceCostTypes?: number[]

  networkCostTypes?: number[]

  instanceId?: string
}

export interface GetInstanceCountReq {
  regionId: number

  zoneIds: number[]
  // 区域id
}

export interface DiskListInstanceReq {
  instanceName: string
  // 实例名称

  instanceId: string
  // 实例insId

  regionId: number

  zoneId: number
}

export interface ListInstanceDetailReq {
  regionId?: number

  zoneId?: number

  instanceName?: string
  // 名称 模糊匹配

  instanceId?: string
  // 实例ID inx-xxxx

  sshId?: number
  // SSH主键ID

  states?: string[]
  // 状态列表
  // BUILD: 创建中
  // LAUNCH_FAILED: 创建失败
  // STOPPING: 关机中
  // STOPPED: 关机
  // STARTING: 开机中
  // RUNNING: 运行中
  // BAND_SSH_ING: 绑定秘钥中
  // UNBAND_SSH_ING: 解绑秘钥中
  // REBOOTING: 重启中
  // REBUILDING: 重启中
  // REBUILDING_SPECIFICATIONS: 重装规格中
  // RESIZE: 变更规格中 DELETED: 实例已被删除
  // SHUTDOWN: 停止待销毁 TERMINATING: 销毁中
}

export interface ListRecommendSpecificationsReq {
  regionId: string | number
  zoneId: string | number
}

export interface GetInstanceFamilyReq {
  regionId: string | number
  zoneId: string | number
}

export interface GetSpecificationsListReq extends Pagination {
  specificationId?: number
  // 规格ID

  regionId: number
  // 地域ID

  zoneId: number
  // 可用区ID

  instanceFamilyId?: number
  // 机型族ID

  instanceTypeId?: number
  // 机型类型

  vcpus?: number | string
  // CPU数目

  ram?: number | string
  // 内存大小

  costType: number
  //计费模式 1 按量计费 2包年包月
}

export interface RefundInstanceReq {
  serverId: string
  // 服务器主键ID

  dataDiskIds: number[]
  // 是否退还IP

  eipIds: number[]
  // 是否退还云硬盘
}

export interface SetInstanceAutoRenewReq {
  serverIds: string[]
  // 服务器主键ID列表

  instanceAutoRenew: boolean
  // 云服务器自动续费状态

  diskAutoRenew: boolean
  // 是否应用到云硬盘
}

export interface InstanceRenewInquiryReq {
  serverIds: string[]
  // 服务器主键ID列表

  renewMonth: number
  // 续费时长（月）

  eipIds?: string[] | number[]
  // 需要续费的EIP列表集合

  renewEip: boolean
  // 是否续费EIP

  dataDiskIds?: string[]
  // 需要续费的数据盘ID
}

export interface InstanceRenewReq {
  serverIds: string[]
  // 服务器主键ID列表

  renewMonth: number
  // 续费时长（月）

  eipIds: string[] | number[]
  // 需要续费的EIP列表集合

  renewEip: boolean
}

export interface VerifyChangeServerTypeReq {
  serverId: number
  // 服务器ID

  instanceTypeId: number
  // 实例规格ID
}

export interface CreateInstanceVerifyReq {
  regionId: number
  // 地域ID

  zoneId: number
  // 可用区ID

  specificationId: number
  // 服务器实例规格ID

  instanceChargeType: number
  // 计费模式
}

export interface GetChangeTypeSupportSpecificationsReq extends Pagination {
  instanceFamilyId?: number
  // 机型族ID

  instanceTypeId?: number
  // 机型类型

  vcpus?: number
  // CPU数目

  ram?: number
  // 内存大小

  instanceId: string
  // 实例规格ID
}

export interface CreateInstanceInquiryReq {
  regionId: number
  // 地域ID

  zoneId: number
  // 可用区ID

  specificationId: number
  // 服务器实例规格ID

  instanceCount: number
  // 购买数量

  imageId: number | string
  // 镜像ID

  imageType: number
  // 镜像类型 1 公共镜像 2 私有镜像 3 市场镜像

  systemDiskType: number
  // 系统盘类型

  systemDiskSize: number
  // 系统盘大小

  instanceChargeType: number
  // 实例计费类型 1 按量计费 2 包年包月

  periodNum: number | string
  // 订购周期 月

  eipInfo: {
    openEip: number
    // 是否开通EIP 1 开通 2不开通

    lineType: number
    // 公网IP线路类型 1 动态BGP 2 静态BGP

    chargeType: number
    // 公网IP计费类型 1 流量按小时计费(按需) 2 带宽包月(预付费)

    size: number
    // 带宽大小

    num: number
    // 数量

    cascadeRelease: number
    // 实例退还后是否自动释放 1 解绑自动释放 2 解绑不释放
  }
}
export interface ChangeServerTypeInquiryReq {
  serverId: string
  // 服务器主键ID

  instanceTypeId: string | number
  // 实例规格ID
}
export interface RefundInstanceInquiryReq {
  serverId: number
  // 服务器主键ID

  dataDiskIds: number[]
  // 是否退还IP

  eipIds: number[]
  // 是否退还云硬盘
}
export interface ExportInstanceReq {
  regionId: number

  zoneIds?: string[]

  instanceName?: string
  // 实例名

  instanceId?: string
  // 实例id ins-xxx

  states?: string[]
  // 实例状态

  instanceCostType?: number
  // 实例计费模式 可选 1 按量计费 2 包年包月

  networkCostType?: number
  // 网络计费模式1 按量计费 2 包年包月

  vpcId: number
  // VPC ID

  subnetId: number
  // 子网ID
}

export interface CreateInstanceDryRunReq {
  regionId: number
  // 地域ID

  zoneId: number
  // 可用区ID

  specificationId: number
  // 服务器实例规格ID

  instanceCount: number
  // 购买数量

  imageId: number
  // 镜像ID

  imageType: number
  // 镜像类型 1 公共镜像 2 私有镜像 3 市场镜像

  systemDiskType: number
  // 系统盘类型

  systemDiskSize: number
  // 系统盘大小

  vpcId: number
  // VPC ID

  subnetId: number
  // 子网ID

  instanceChargeType: number
  // 实例计费类型 1 按量计费 2 包年包月

  periodNum: number
  // 订购周期 月
}

export interface GetCacheParamReq {
  id: number | string
  // 地域ID
}

export interface ReleaseInstanceReq {
  serverId: number
  // 服务器ID
}

export interface ModifyInstancesChargeTypeReq {
  instanceId: number
  // 实例ID
  autoRenew: boolean
  // 是否自动续费
  period: number
  // 续费时长
  instanceChangeType?: number
  // 目标计费模式 暂时只支持 按量计费转包年包月
}

export interface ModifyInstancesChargeTypeInquiryReq {
  instanceId: number
  // 实例ID
  autoRenew: boolean
  // 是否自动续费
  period: number
  // 续费时长
  instanceChangeType?: number
  // 目标计费模式 暂时只支持 按量计费转包年包月
}
