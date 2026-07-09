import { POSITIVE_0_INT_REG } from '@/utils/reg'
import t from '@/utils/i18n'

export const type1Columns: TableColumn[] = [
  { label: t('columns.hostRecord'), prop: 'hostRecord', minWidth: '15%', tooltip: false },
  { label: t('columns.recordType'), prop: 'recordType', minWidth: '14.5', tooltip: false },
  { label: t('columns.lineType'), prop: 'lineTypeId', minWidth: '14.5', tooltip: false },
  { label: t('columns.weights'), prop: 'weight', minWidth: '12%' },
  { label: t('columns.mx'), prop: 'mx', minWidth: '12%' },
  { label: t('columns.ttl'), prop: 'ttl', minWidth: '12%' },
  { label: t('columns.recordValue'), prop: 'recordValue', minWidth: '20%' },
]

const EMPTY_MSG = t('recordMana.cannotEmpty')
// radio的校验
export const type1NewValidate: any = {
  // 主机记录
  hostRecord: (data: any) => {
    data.error = data.value ? '' : EMPTY_MSG
    return data
  },
  //   记录类型
  recordType: (data: any) => {
    const { value, recordValue /*weight*/ } = data
    console.log('进来这个校验', data)

    // 记录类型和记录值都不能为空
    if (!value || !recordValue) {
      data.error = t('batchOperation.emptyTypeAndValue')
    }
    // else if (!IPv4_REG.test(recordValue)) {
    //   data.error = "请填写正确的记录值";
    // }
    // else if (!INT0TO100_REG.test(weight)) {
    //   data.error = "权重不合法。请输入 0 - 100 的整数";
    // }
    else {
      data.error = ''
    }
    return data
  },
  // mx
  // mx: (data: any) => {
  //   const { value } = data;
  //   if (!value) {
  //     data.error = EMPTY_MSG;
  //   } else if (!POSITIVE_0_INT_REG.test(value)) {
  //     data.error = "记录的 MX 值必须为整数";
  //   } else if (Number(value) > 50) {
  //     data.error = "MX 优先级输入错误，请填写 0~50 的数值。";
  //   } else {
  //     data.error = "";
  //   }
  // },
  //   TTL
  ttl: (data: any) => {
    const { value } = data
    if (!value) {
      data.error = EMPTY_MSG
    } else if (!POSITIVE_0_INT_REG.test(value)) {
      data.error = t('recordMana.TTLvalidate1')
    } else if (Number(value) < 1 || Number(value) > 604800) {
      data.error = t('recordMana.TTLvalidate2')
    } else {
      data.error = ''
    }
    return data
  },
}

export const type1NewValidateAll = (data: any) => {
  try {
    data.hostRecord = type1NewValidate.hostRecord(data.hostRecord)
    data.recordType = type1NewValidate.recordType(data.recordType)
    data.ttl = type1NewValidate.ttl(data.ttl)
    return data
  } catch (error) {
    return data
  }
}
