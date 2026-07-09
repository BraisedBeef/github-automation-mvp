import t from '@/utils/i18n'

export const CHANNEL_MAP = {
  0: '-',
  1: t('incomeExpenditure.userBalance'), // 用户余额
  2: t('incomeExpenditure.wechat'), // 微信
  3: t('incomeExpenditure.alipay'), // 支付宝
  4: 'foxpay', // foxpay
  5: t('incomeExpenditure.creditCard'), // 信用卡
  6: 'USDT', // USDT
  101: t('incomeExpenditure.offline'), // 线下汇款
  102: t('incomeExpenditure.platformRecharge'), // 平台充值
} // 交易渠道

export const INCOME_TYPE_MAP = {
  1: t('incomeExpenditure.rechargeMoney'), // 充值
  2: t('incomeExpenditure.deductionMoney'), // 扣费
  3: t('incomeExpenditure.advancePay'), // 垫付
  4: t('incomeExpenditure.advancePayReturn'), // 垫付回款
  5: t('incomeExpenditure.charge'), // 充账
  6: t('incomeExpenditure.refund'), // 退款
}

export const INCOME_TYPE_ARR_MAP = [
  {
    value: 0,
    label: t('incomeExpenditure.allType'), // 全部交易类型
  },
  {
    value: 1,
    label: t('incomeExpenditure.rechargeMoney'), // 充值
  },
  {
    value: 2,
    label: t('incomeExpenditure.deductionMoney'), // 扣费
  },
  {
    value: 3,
    label: t('incomeExpenditure.advancePay'), // 垫付
  },
  {
    value: 4,
    label: t('incomeExpenditure.advancePayReturn'), // 垫付回款
  },
  {
    value: 5,
    label: t('incomeExpenditure.charge'), // 充账
  },
  {
    value: 6,
    label: t('incomeExpenditure.refund'), // 退款
  },
  {
    value: 7,
    label: t('incomeExpenditure.freeze'), // 冻结
  },
  {
    value: 8,
    label: t('incomeExpenditure.thaw'), // 解冻
  },
]

// 是否能查看详情
export const isSeeDetail = (incomeType: number) => {
  return [1, 2, 5].includes(incomeType)
}
