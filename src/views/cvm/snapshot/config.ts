import { PRIMARY_COLOR, GREEN_COLOR, RED_COLOR, YELLOW_COLOR, BLUE_COLOR } from '@/views/cvm/disk/config'
import { mapToKeyValueArray } from '@/views/cvm/utils'
import t from '@/utils/i18n'
import { permMap } from '@/hooks/permission/use-cvm-and-network-permission'

// 快照状态
export const SNAPSHOT_STATE_MAP = {
  1: t('snapshot.config.normal'), // 正常
  2: t('snapshot.config.creating'), // 创建中
  3: t('snapshot.config.rollingBack'), // 回滚中
  4: t('snapshot.config.crossRegionReplicateProgress'), // 跨地域复制中
  5: t('snapshot.config.copyVerificateProgress'), // 复制校验中
  6: t('snapshot.config.recycled'), // 待回收
  7: t('snapshot.config.deleted'), // 已删除
}

// 快照状态
export const SNAPSHOT_STATE_FILTER_MAP = {
  1: t('snapshot.config.normal'), // 正常
  2: t('snapshot.config.creating'), // 创建中
  3: t('snapshot.config.rollingBack'), // 回滚中
  4: t('snapshot.config.crossRegionReplicateProgress'), // 跨地域复制中
  5: t('snapshot.config.copyVerificateProgress'), // 复制校验中
}

// 快照状态
export const SNAPSHOT_STATE_ARR_MAP = [
  {
    text: t('snapshot.config.normal'),
    color: GREEN_COLOR,
    value: 1,
  },
  {
    text: t('snapshot.config.creating'),
    color: PRIMARY_COLOR,
    value: 2,
  },
  {
    text: t('snapshot.config.rollingBack'),
    color: PRIMARY_COLOR,
    value: 3,
  },
  {
    text: t('snapshot.config.crossRegionReplicateProgress'),
    color: YELLOW_COLOR,
    value: 4,
  },
  {
    text: t('snapshot.config.copyVerificateProgress'),
    color: YELLOW_COLOR,
    value: 5,
  },
  {
    text: t('snapshot.config.recycled'),
    color: BLUE_COLOR,
    value: 6,
  },
  {
    text: t('snapshot.config.deleted'),
    color: RED_COLOR,
    value: 7,
  },
]

// 快照状态
export const SNAPSHOT_STATE_FILTER_ARR_MAP = mapToKeyValueArray(SNAPSHOT_STATE_FILTER_MAP, true)

// 快照列表更多操作
export const SNAPSHOT_MORE_OPTS = [
  {
    value: 'createDisk',
    label: t('snapshot.config.createDisk'),
    perm: permMap.snapshot.CREATE_HD_FROM_SNAPSHOT,
  },
  // {
  //   value: 'createCustomImage',
  //   label: '新建自定义镜像',
  // },
  {
    value: 'chain',
    label: t('snapshot.config.setChain'),
  },
]

// 快照链更多操作
export const SNAPSHOT_CHAIN_MORE_OPTS = [
  {
    value: 'createDisk',
    label: t('snapshot.config.createDisk'),
    perm: permMap.snapshot.CREATE_HD_FROM_SNAPSHOT,
  },
  // {
  //   value: 'createCustomImage',
  //   label: '新建自定义镜像',
  // },
]

// 快照策略备份日期
export const SNAPSHOT_STRAGETY_WEEK_MAP = [
  {
    value: 0,
    label: t('snapshot.config.Sunday'),
  },
  {
    value: 1,
    label: t('snapshot.config.Monday'),
  },
  {
    value: 2,
    label: t('snapshot.config.Tuesday'),
  },
  {
    value: 3,
    label: t('snapshot.config.Wednesday'),
  },
  {
    value: 4,
    label: t('snapshot.config.Thursday'),
  },
  {
    value: 5,
    label: t('snapshot.config.Friday'),
  },
  {
    value: 6,
    label: t('snapshot.config.Saturday'),
  },
]

// 快照策略备份时间
export const SNAPSHOT_STRAGETY_HOUR_MAP = [
  {
    value: 0,
    label: '00:00',
  },
  {
    value: 1,
    label: '01:00',
  },
  {
    value: 2,
    label: '02:00',
  },
  {
    value: 3,
    label: '03:00',
  },
  {
    value: 4,
    label: '04:00',
  },
  {
    value: 5,
    label: '05:00',
  },
  {
    value: 6,
    label: '06:00',
  },
  {
    value: 7,
    label: '07:00',
  },
  {
    value: 8,
    label: '08:00',
  },
  {
    value: 9,
    label: '09:00',
  },
  {
    value: 10,
    label: '10:00',
  },
  {
    value: 11,
    label: '11:00',
  },
  {
    value: 12,
    label: '12:00',
  },
  {
    value: 13,
    label: '13:00',
  },
  {
    value: 14,
    label: '14:00',
  },
  {
    value: 15,
    label: '15:00',
  },
  {
    value: 16,
    label: '16:00',
  },
  {
    value: 17,
    label: '17:00',
  },
  {
    value: 18,
    label: '18:00',
  },
  {
    value: 19,
    label: '19:00',
  },
  {
    value: 20,
    label: '20:00',
  },
  {
    value: 21,
    label: '21:00',
  },

  {
    value: 22,
    label: '22:00',
  },

  {
    value: 23,
    label: '23:00',
  },
]

export const SNAPSHOT_STRAGETY_NAME_REG = /^.{1,64}$/

// 是否能删除
export const isDelete = (state: number) => {
  return [1, 6].includes(state)
}

// 是否能删除(批量)
export const isDeleteBatch = (stateList: number[]) => {
  return stateList.length ? stateList.every(el => isDelete(el)) : false
}

// 是否能回滚
export const isRollBack = (state: number) => {
  return [1].includes(state)
}

// 是否能新建云硬盘
export const isCreateDisk = (state: number, diskType) => {
  return [1].includes(state) && diskType === 2
}

// 是否能查看快照链
export const isSeeChain = (state: number) => {
  return [1].includes(state)
}

// 关联硬盘是否存在
export const isHasBindDisk = (diskState: number) => {
  return ![8, 9, 10, 11, 12, 14, 99].includes(diskState)
}
