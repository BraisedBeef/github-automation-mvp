import t from '@/utils/i18n'
export const typeList = [
  {
    label: t('publicIp.cvmIns'),
    value: 1,
  },
  {
    label: t('publicIp.networkCard'),
    value: 2,
  },
]

export const initPaginationConfig = {
  pageSize: 10,
  pageIndex: 0,
  total: 0,
  totalPage: 0,
}
