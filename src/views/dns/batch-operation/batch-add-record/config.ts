import { INT0TO100_REG, POSITIVE_0_INT_REG } from '@/utils/reg'
import { IPv4_REG } from '@/utils/reg'
import t from '@/utils/i18n'
export const type1columns: TableColumn[] = [
  { label: t('columns.hostRecord'), prop: 'hostRecord', minWidth: '16%' },
  { label: t('columns.recordType'), prop: 'recordType', minWidth: '16%' },
  { label: t('columns.lineType'), prop: 'lineType', minWidth: '14%' },
  { label: t('columns.recordValue'), prop: 'recordValue', minWidth: '14%' },
  { label: t('columns.weights'), prop: 'weight', minWidth: '10%' },
  { label: t('columns.mx'), prop: 'mx', minWidth: '10%' },
  { label: t('columns.ttl'), prop: 'ttl', minWidth: '10%' },
  { label: t('columns.operation'), prop: 'handle', minWidth: '10%' },
]

IPv4_REG

const EMPTY_MSG = t('recordMana.cannotEmpty')
export interface SingleValidate {
  [x: string]: any
  hostRecord: any
  weight: (value: string) => {}
  mx: any
  ttl: any
  recordValue: any
}
// type1单个数据的校验
export const singleValidate: SingleValidate = {
  // hostRecord
  hostRecord: (value: string) => {
    return {
      is_host_error: !value,
      host_error: value ? '' : EMPTY_MSG,
    }
  },
  // 权重
  weight: (value: string) => {
    let is_weight_error: boolean = true,
      weight_error: string = ''
    // 权重如果没写 就默认值0
    if (!value) {
      value = '0'
    }
    if (!INT0TO100_REG.test(value)) {
      weight_error = t('recordMana.weightValidate')
    } else {
      is_weight_error = false
    }
    return {
      is_weight_error,
      weight_error,
    }
  },
  // 优先级
  mx: (value: string) => {
    let is_mx_error: boolean = true,
      mx_error: string = ''
    if (!value) {
      value = '0'
    }
    if (!POSITIVE_0_INT_REG.test(value)) {
      mx_error = t('recordMana.mxValidate1')
    } else if (Number(value) > 50) {
      mx_error = t('recordMana.mxValidate2')
    } else {
      is_mx_error = false
    }
    return {
      is_mx_error,
      mx_error,
    }
  },
  // ttl
  ttl: (value: string) => {
    let is_ttl_error: boolean = true,
      ttl_error: string = ''
    if (!value) {
      value = '0'
    }
    if (!POSITIVE_0_INT_REG.test(value)) {
      ttl_error = t('recordMana.TTLvalidate1')
    } else if (Number(value) > 604800 || Number(value) < 1) {
      ttl_error = t('recordMana.TTLvalidate2')
    } else {
      is_ttl_error = false
    }
    return {
      is_ttl_error,
      ttl_error,
    }
  },
  // 记录值
  recordValue: (value: string) => {
    let is_recordValue_error: boolean = true,
      recordValue_error: string = ''
    if (!value) {
      recordValue_error = EMPTY_MSG
    }

    // else if (!IPv4_REG.test(value)) {
    //   recordValue_error =
    //     "请填写您邮件服务器的 IP 地址或企业邮局给您提供的域名，如果您不知道，请咨询您的邮件服务提供商";
    // }
    else {
      is_recordValue_error = false
    }
    return {
      is_recordValue_error,
      recordValue_error,
    }
  },
}
// 多个校验
export const multipleValidate = (row: any) => {
  const dnsRes = singleValidate.hostRecord(row.hostRecord)
  const weightRes = singleValidate.weight(row.weight)
  const mxRes = singleValidate.mx(row.mx)
  const ttlRes = singleValidate.ttl(row.ttl)
  const recordValueRes = singleValidate.recordValue(row.recordValue)
  return {
    ...row,
    ...dnsRes,
    ...weightRes,
    ...mxRes,
    ...ttlRes,
    ...recordValueRes,
  }
}

// type1隐藏所有input的校验框
export const type1ClearValidate = (tableData: any[]) => {
  tableData.forEach((item: any) => {
    item.is_host_error = false
    item.is_weight_error = false
    item.is_mx_error = false
    item.is_ttl_error = false
    item.is_recordValue_error = false
  })
}

export const type2Columns: TableColumn[] = [
  { label: t('columns.hostRecord'), prop: 'hostRecord', width: 276 },
  { label: t('columns.recordType'), prop: 'recordType', width: 276 },
  { label: t('columns.lineType'), prop: 'lineType', width: 270 },
  { label: t('columns.recordValue'), prop: 'recordValue', width: 340 },
  { label: t('columns.weights'), prop: 'weight', width: 240 },
  { label: t('columns.ttl'), prop: 'ttl', width: 240 },
]
