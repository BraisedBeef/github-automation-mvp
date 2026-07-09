import t from '@/utils/i18n'

export const isDefaultList = [
  { label: t('privateNetwork.yes'), value: '1' },
  { label: t('privateNetwork.no'), value: '2' },
]

// 修改名称格式校验，影响范围，如有改动需要通知
export const nameRules = {
  inputValue: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error(t('')))
        } else if (!/^[\w\u4e00-\u9fa5.-]{1,60}$/.test(value)) {
          callback(new Error(t('')))
        } else {
          callback()
        }
      },
    },
  ],
}
