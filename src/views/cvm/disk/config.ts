import { mapToKeyValueArray } from '@/views/cvm/utils'
import t from '@/utils/i18n'
import { permMap } from '@/hooks/permission/use-cvm-and-network-permission'

export const PRIMARY_COLOR = '#0063ff'
export const GREEN_COLOR = '#02de6d'
export const RED_COLOR = '#fe4d4f'
export const YELLOW_COLOR = '#fc8c00'
export const BLUE_COLOR = '#68ceff'
export const GREY_COLOR = '#D3D3D3'

// 是否为包年包月
export const isTimeCost = (costType: number) => {
  return [2].includes(costType)
}

// 是否为按量计费
export const isFlowCost = (costType: number) => {
  return [1].includes(costType)
}

// 硬盘属性
export const DISK_TYPE_MAP = {
  1: t('disk.config.sysDisk'),
  2: t('disk.config.dataDisk'),
}

// 默认请求的硬盘状态
export const DISK_DEFAULT_STATES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15]

// 硬盘属性
export const DISK_TYPE_FILTER_MAP = mapToKeyValueArray(DISK_TYPE_MAP, true)

// 所有硬盘状态
export const DISK_STATE_MAP = {
  1: t('disk.config.creating'), // 创建中
  2: t('disk.config.noMount'), // 未挂载
  3: t('disk.config.expansing'), // 扩容中
  4: t('disk.config.renewing'), // 续费中
  5: t('disk.config.monuting'), // 挂载中
  6: t('disk.config.monuted'), // 已挂载
  7: t('disk.config.uninstalling'), // 卸载中
  8: t('disk.config.returning'), // 退还中
  9: t('disk.config.expired'), // 已过期
  10: t('disk.config.recycled'), // 待回收
  11: t('disk.config.recovering'), // 恢复中
  12: t('disk.config.destructing'), // 销毁中
  13: t('disk.config.snapshotRollbacking'), // 快照回滚中
  14: t('disk.config.freeze'), // 冻结
  15: t('disk.config.snapshotCreating'), // 创建快照中
  99: t('disk.config.destructed'), // 已销毁
}

// 硬盘状态
export const DISK_STATE_ARR_MAP = [
  {
    text: t('disk.config.creating'), // 创建中
    color: PRIMARY_COLOR,
    value: 1,
  },
  {
    text: t('disk.config.noMount'), // 未挂载
    color: YELLOW_COLOR,
    value: 2,
  },
  {
    text: t('disk.config.expansing'), // 扩容中
    color: PRIMARY_COLOR,
    value: 3,
  },
  {
    text: t('disk.config.renewing'), // 续费中
    color: PRIMARY_COLOR,
    value: 4,
  },
  {
    text: t('disk.config.monuting'), // 挂载中
    color: PRIMARY_COLOR,
    value: 5,
  },
  {
    text: t('disk.config.monuted'), // 已挂载
    color: GREEN_COLOR,
    value: 6,
  },
  {
    text: t('disk.config.uninstalling'), // 卸载中
    color: YELLOW_COLOR,
    value: 7,
  },
  {
    text: t('disk.config.returning'), // 退还中
    color: YELLOW_COLOR,
    value: 8,
  },
  {
    text: t('disk.config.expired'), // 已过期
    color: RED_COLOR,
    value: 9,
  },
  {
    text: t('disk.config.recycled'), // 待回收
    color: BLUE_COLOR,
    value: 10,
  },
  {
    text: t('disk.config.recovering'), // 恢复中
    color: PRIMARY_COLOR,
    value: 11,
  },
  {
    text: t('disk.config.destructing'), // 销毁中
    color: YELLOW_COLOR,
    value: 12,
  },
  {
    text: t('disk.config.snapshotRollbacking'), // 快照回滚中
    color: PRIMARY_COLOR,
    value: 13,
  },
  {
    text: t('disk.config.freeze'), // 冻结
    color: RED_COLOR,
    value: 14,
  },
  {
    text: t('disk.config.snapshotCreating'), // 创建快照中
    color: PRIMARY_COLOR,
    value: 15,
  },
  {
    text: t('disk.config.destructed'), // 已销毁
    color: RED_COLOR,
    value: 99,
  },
]

// 硬盘状态
export const DISK_STATE_FILTER_MAP = {
  2: t('disk.config.noMount'), // 未挂载
  3: t('disk.config.expansing'), // 扩容中
  5: t('disk.config.monuting'), // 挂载中
  7: t('disk.config.uninstalling'), //卸载中
  13: t('disk.config.snapshotRollbacking'), // 快照回滚中
  10: t('disk.config.recycled'), //待回收
}

// 硬盘状态
export const DISK_STATE_FILTER_ARR_MAP = mapToKeyValueArray(DISK_STATE_FILTER_MAP, true)

export const COST_TYPE_BTN_GROUP_MAP = [
  {
    label: t('disk.config.timeCost'), // 包年包月
    value: 2,
  },
  {
    label: t('disk.config.flowCost'), // 按量计费
    value: 1,
  },
]

export const DISK_DURATION_MAP = [
  {
    value: 1,
    label: t('disk.config.1month'),
    more: '',
  },
  {
    value: 2,
    label: t('disk.config.2month'),
    more: '',
  },
  {
    value: 3,
    label: t('disk.config.3month'),
    more: '',
  },
  {
    value: 4,
    label: t('disk.config.4month'),
    more: '',
  },
  {
    value: 5,
    label: t('disk.config.5month'),
    more: '',
  },
  {
    value: 6,
    label: t('disk.config.6month'),
    more: '',
  },
  {
    value: 7,
    label: t('disk.config.7month'),
    more: '',
  },
  {
    value: 8,
    label: t('disk.config.8month'),
    more: '',
  },
  {
    value: 9,
    label: t('disk.config.9month'),
    more: '',
  },
  {
    value: 10,
    label: t('disk.config.10month'),
    more: '',
  },
  {
    value: 11,
    label: t('disk.config.11month'),
    more: '',
  },
  {
    value: 12,
    label: t('disk.config.1year'),
    more: '',
  },
  {
    value: 24,
    label: t('disk.config.2year'),
    more: '',
  },
  {
    value: 36,
    label: t('disk.config.3year'),
    more: '',
  },
] // 硬盘时长

// 最多支持60个字符，特殊符号-_. => 兼容腾讯华为厂商命名规则
export const DISK_NAME_LEN_MIN = 1
export const DISK_NAME_LEN_MAX = 60
export const DISK_NAME_REGEX = new RegExp(
  `^[a-zA-Z0-9\u4e00-\u9fa5-_\.]{${DISK_NAME_LEN_MIN - 1},${DISK_NAME_LEN_MAX - 1}}$`,
)

// 硬盘更多操作
export const DISK_MORE_OPTS = [
  {
    value: 'expans',
    label: t('disk.config.expans'),
    costType: [1, 2],
    perm: permMap.disk.RESET_HD_SIZE, // 权限标识
  },
  {
    value: 'mount',
    label: t('disk.config.monut'),
    costType: [1, 2],
    perm: permMap.disk.ATTACH_HD_TO_VM,
  },
  {
    value: 'uninstall',
    label: t('disk.config.uninstall'),
    costType: [1, 2],
    perm: permMap.disk.DETTACH_HD_FROM_VM,
  },
  // {
  //   value: 'init',
  //   label: '重新初始化',
  // },
  {
    value: 'setAutoRenew',
    label: t('disk.config.setAutoRenew'),
    costType: [2],
    perm: permMap.disk.SET_HD_AUTO_RENEW,
  },
  // {
  //   value: 'setProject',
  //   label: t('disk.config.setProject'),
  // },
  {
    value: 'destruction',
    label: t('disk.config.destruction'),
    costType: [1, 2],
    perm: permMap.disk.REFUND_HD,
  },
  {
    value: 'flowToTime',
    label: t('disk.config.flowToTime'),
    costType: [1],
    perm: permMap.disk.CONVERT_BILLING,
  },
  // {
  //   value: 'flowToTime',
  //   label: t('disk.config.timeToFlow'),
  //   costType: [2],
  //   // perm: permMap.disk.REFUND_HD,
  // },
  // {
  //   value: 'openPoint',
  //   label: '开启数据备份点',
  // },
]

// 日志状态
export const LOG_STATE_MAP = {
  1: t('disk.config.inProgress'),
  2: t('disk.config.success'),
  3: t('disk.config.fail'),
}

export const MONITER_PERIOD_MAP = [
  {
    value: 60,
    label: t('disk.config.1m'),
  },
  {
    value: 300,
    label: t('disk.config.5m'),
  },
  {
    value: 3600,
    label: t('disk.config.1h'),
  },
  {
    value: 86400,
    label: t('disk.config.1d'),
  },
] // 监控时长

// 硬盘监控指标
export const HARDDISK_MONITER_METRIC_MAP = {
  readFlow: 'hard_disk_read_flow',
  writeFlow: 'hard_disk_write_flow',
  readIOPS: 'hard_disk_read_iops',
  writeIOPS: 'hard_disk_write_iops',
  IOAwait: 'hard_disk_io_wait_time',
  IOSvctm: 'hard_disk_io_service_time',
  IOUtil: 'hard_disk_io_busy_ratio',
}

// 是否为系统盘
export const isSysDisk = (diskType: number) => {
  return diskType === 1
}

// 是否为数据盘
export const isDataDisk = (diskType: number) => {
  return diskType === 2
}

// 是否能挂载=>数据盘
export const isMount = (diskType: number, state: number) => {
  if (isDataDisk(diskType)) {
    return ![1, 5, 6, 7, 8, 9, 10, 12, 99].includes(state)
  } else {
    return false
  }
}

// 是否能挂载=>数据盘(批量)
export const isMountBatch = (diskTypeList: number[], stateList: number[]) => {
  if (diskTypeList.length && stateList.length) {
    const diskTypeRes = diskTypeList.every(el => isDataDisk(el))
    const stateRes = stateList.every(el => ![1, 5, 6, 7, 8, 9, 10, 12, 99].includes(el))
    return diskTypeRes && stateRes
  } else {
    return false
  }
}

// 是否能续费=>包年包月+数据盘
export const isRenew = (diskType: number, costType: number, state: number) => {
  if (isTimeCost(costType) && isDataDisk(diskType)) {
    return ![1, 3, 5, 7, 8, 9, 12, 99].includes(state)
  } else {
    return false
  }
}

// 是否能扩容
export const isExpans = (state: number) => {
  return ![1, 3, 5, 9, 10, 12, 13, 99].includes(state)
}

// 是否能卸载=>数据盘
export const isUninstall = (diskType: number, state: number) => {
  if (isDataDisk(diskType)) {
    return ![1, 2, 3, 5, 7, 8, 10, 12, 99].includes(state)
  } else {
    return false
  }
}

// 是否能卸载=>数据盘(批量)
export const isUninstallBatch = (diskTypeList: number[], stateList: number[]) => {
  if (diskTypeList.length && stateList.length) {
    const diskTypeRes = diskTypeList.every(el => isDataDisk(el))
    const stateRes = stateList.every(el => ![1, 2, 3, 5, 7, 8, 10, 12, 99].includes(el))
    return diskTypeRes && stateRes
  } else {
    return false
  }
}

// 是否能销毁/退还=>数据盘
export const isDestruction = (diskType: number, state: number) => {
  if (isDataDisk(diskType)) {
    return ![1, 3, 5, 6, 7, 8, 9, 12, 99].includes(state)
  } else {
    return false
  }
}

// 是否能销毁/退还=>数据盘(批量)
export const isDestructionBatch = (diskTypeList: number[], stateList: number[], costTypeList: number[]) => {
  if (diskTypeList.length && stateList.length) {
    const timeCostRes = costTypeList.every(el => isTimeCost(el))
    const flowCostRes = costTypeList.every(el => isFlowCost(el))
    if (timeCostRes || flowCostRes) {
      const diskTypeRes = diskTypeList.every(el => isDataDisk(el))
      const stateRes = stateList.every(el => ![1, 3, 5, 6, 7, 8, 9, 10, 12, 99].includes(el))
      return diskTypeRes && stateRes
    } else {
      return false
    }
  } else {
    return false
  }
}

// 是否能自动续费=>包年包月+数据盘
export const isSetAutoRenew = (diskType: number, costType: number, state) => {
  if (isTimeCost(costType) && isDataDisk(diskType)) {
    return ![1, 3, 5, 7, 8, 9, 10, 12, 99].includes(state)
  } else {
    return false
  }
}

// 是否能分配项目
export const isSetProject = (state: number) => {
  return ![1].includes(state)
}

// 是否能创建快照
export const isCreateSnapshot = (diskType: number, state: number) => {
  if (isDataDisk(diskType)) {
    return ![1, 3, 5, 7, 9, 10, 12, 15, 99].includes(state)
  } else {
    return false
  }
}

// 是否为待回收
export const isRecovery = (state: number) => {
  return [10].includes(state)
}

// 是否能按量转包年包月=>按量计费+数据盘
export const isFlowToTime = (diskType: number, costType: number, state: number) => {
  if (isFlowCost(costType) && isDataDisk(diskType)) {
    return ![1, 8, 9, 10, 12, 13, 14, 99].includes(state)
  } else {
    return false
  }
}

// 粒度
export const PERIOD_MAP = {
  60: t('disk.config.1m'),
  300: t('disk.config.5m'),
  3600: t('disk.config.1h'),
  86400: t('disk.config.1d'),
}

// 快照名称 1到64字符，特殊符号-_.=>兼容腾讯华为厂商命名规则
export const SNAPSHOT_NAME_LEN_MIN = 1
export const SNAPSHOT_NAME_LEN_MAX = 60
export const SNAPSHOT_NAME_REG = new RegExp(
  `^[a-zA-Z0-9\u4e00-\u9fa5-_\.]{${SNAPSHOT_NAME_LEN_MIN},${SNAPSHOT_NAME_LEN_MAX}}$`,
)

export const SNAPSHOT_COUNT_MAX = 7

export const SYS_DISK_SIZE_MAX = 1024 // 创建系统盘大小的最大值
export const SYS_DISK_SIZE_MIN = 50 // 创建系统盘大小的最小值

export const DATA_DISK_SIZE_MAX = 32000 // 创建数据盘大小的最大值
export const DATA_DISK_SIZE_MIN = 50 // 创建数据盘大小的最小值

export const CREATE_DISK_COUNT_MAX = 50 // 创建云硬盘（数据盘）最大数量
export const MOUNT_DISK_COUNT_MAX = 20 // 实例挂载硬盘最大数量
