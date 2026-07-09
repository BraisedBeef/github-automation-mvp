import { IPv4_REG, INT0TO100_REG, POSITIVE_0_INT_REG } from '@/utils/reg'
import t from '@/utils/i18n'
export const analysisStatus = [
  { label: t('domainSet2.parseStatus1'), value: 1, class: 'text-success' },
  { label: t('domainSet2.parseStatus2'), value: 2, class: 'text-warning' },
  { label: t('domainSet2.parseStatus3'), value: 3, class: 'text-error' },
]

export const columns: TableColumn[] = [
  {
    prop: 'hostRecord',
    label: t('columns.hostRecord'),
    tip: t('recordMana.hostTip'),
    width: 100,
  },
  {
    prop: 'recordType',
    label: t('columns.recordType'),
    tip: t('recordMana.recordTypeTip'),
    width: 140,
  },
  {
    prop: 'lineType',
    label: t('columns.lineType'),
    tip: t('recordMana.lineTip'),
    width: 140,
    tooltip: true,
  },
  {
    prop: 'recordValue',
    label: t('columns.recordValue'),
    tip: t('recordMana.recordValueTip'),
    width: 150,
    tooltip: true,
  },
  {
    prop: 'weight',
    label: t('columns.weights'),
    tip: t('recordMana.weightTip'),
    minWidth: 90,
  },
  {
    prop: 'mx',
    label: t('columns.mx'),
    tip: t('recordMana.mxTip'),
    minWidth: 90,
  },
  {
    prop: 'ttl',
    label: 'TTL',
    tip: t('recordMana.ttlTip'),
    minWidth: 90,
  },

  {
    prop: 'monitor',
    label: t('columns.monitor'),
    minWidth: 90,
  },
  {
    prop: 'xOptimize',
    label: t('columns.X'),
    // tip: '-',
    minWidth: 140,
  },
  {
    prop: 'status',
    label: t('columns.status'),
    tip: t('recordMana.statusTip'),
    width: 120,
  },
  {
    prop: 'remark',
    label: t('columns.remark'),
    width: 120,
    tooltip: true,
  },
  {
    prop: 'updateTime',
    label: t('columns.lastUpdated'),
    width: 220,
    tooltip: true,
  },
  {
    prop: 'handle',
    label: t('columns.operation'),
    width: 300,
    fixed: 'right',
  },
]

export const noticeObj: any = {
  // 主机记录的提示语
  '#host_record': [
    { title: 'www', text: t('recordMana.host_record1') },
    { title: '@', text: t('recordMana.host_record2') },
    { title: 'mail', text: t('recordMana.host_record3') },
    { title: '*', text: t('recordMana.host_record4') },
    { title: t('recordMana.host_record1_title'), text: t('recordMana.host_record5') },
  ],
  // 记录类型的提示语根据接口返回动态生成
  '#record_type': [],
  // 线路
  '#line_type': [
    { text: t('recordMana.line_type1') },
    {
      fn: (lineName: string) => {
        console.log('呵呵', lineName)
        return lineName
      },
    },
    // {
    //   title: t('common.default'),
    //   text: t('recordMana.line_type2'),
    // },
    // {
    //   title: t('recordMana.Unicom'),
    //   text: t('recordMana.line_type3'),
    // },
    // { title: t('recordMana.SearchEngines'), text: t('recordMana.line_type4') },
  ],
  // 权重
  '#weight': [
    {
      text: t('recordMana.weight1'),
    },
    {
      text: t('recordMana.weight2'),
    },
    {
      text: t('recordMana.weight3'),
    },
    {
      text: t('recordMana.weight4'),
    },
    {
      text: t('recordMana.weight5'),
    },
  ],
  // 优先级
  '#mx': [{ text: '' }, { title: '5', text: t('recordMana.mx1') }, { title: '10', text: t('recordMana.mx2') }],
  // ttl
  '#ttl': [
    { text: t('recordMana.ttl1') },
    { title: '600', text: t('recordMana.ttl2') },
    {
      title: '3600',
      text: t('recordMana.ttl3'),
    },
    { title: '60', text: t('recordMana.ttl4') },
  ],
  '#record_value': [{ text: t('recordMana.record_value1') }],
}

export const noticeTitle = {
  '#host_record': t('columns.hostRecord'),
  '#record_type': t('columns.recordType'),
  '#line_type': t('columns.lineType'),
  '#weight': t('columns.weights'),
  '#mx': t('columns.mx'),
  '#ttl': 'TTL',
  '#record_value': t('columns.recordValue'),
}

// 校验
export const singleValidate: any = {
  host: (value: string) => {
    return value ? '' : t('recordMana.cannotEmpty')
  },
  weight: (value: string) => {
    let res: any = void 0
    if (!INT0TO100_REG.test(value)) {
      res = t('recordMana.weightValidate')
    } else {
      res = ''
    }
    return res
  },
  mx: (value: string) => {
    let res: any = void 0
    if (!POSITIVE_0_INT_REG.test(value)) {
      res = t('recordMana.mxValidate1')
    } else if (Number(value) > 50) {
      res = t('recordMana.mxValidate2')
    } else {
      res = ''
    }
    return res
  },
  ttl: (value: string) => {
    let res: any = void 0
    if (!POSITIVE_0_INT_REG.test(value)) {
      res = t('recordMana.TTLvalidate1')
    } else if (Number(value) > 604800 || Number(value) < 1) {
      res = t('recordMana.TTLvalidate2')
    } else {
      res = ''
    }
    return res
  },
  record_value: (value: string, row: any) => {
    let res: any = void 0
    // 不能为空
    if (!value) {
      res = t('recordMana.cannotEmpty')
    }
    // else if (!IPv4_REG.test(value)) {
    //   res =
    //     "请填写您邮件服务器的 IP 地址或企业邮局给您提供的域名，如果您不知道，请咨询您的邮件服务提供商";
    // }
    else {
      res = ''
    }
    return res
  },
}
