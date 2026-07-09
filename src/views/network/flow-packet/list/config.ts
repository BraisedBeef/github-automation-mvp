import t from '@/utils/i18n'

export const FLOW_PACKET_STATE_MAP = [
  { label: t('flowPacket.normal'), value: 1 },
  { label: t('flowPacket.usedUp'), value: 2 },
  { label: t('flowPacket.expire'), value: 3 },
  // { label: t('flowPacket.expired'), value: 4 }, 01.16产品说已失效状态先注释掉  因为后端还没实现
]

export const FLOW_PACKET_MORE_OPTS = [
  { label: t('flowPacket.removeEip'), value: 'removeEip', perm: 'REMOVE_EIP' },
  { label: t('flowPacket.viewMonitoring'), value: 'viewMonitoring' },
]

export const DURATION_UNIT_MAP = [
  { label: t('flowPacket.month'), value: 1 },
  { label: t('flowPacket.year'), value: 2 },
]

export const initPaginationConfig = {
  pageSize: 10,
  pageIndex: 0,
  total: 0,
  totalPage: 0,
}
