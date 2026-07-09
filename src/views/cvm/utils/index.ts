import t from '@/utils/i18n'
import { randomPassword, lower, upper, digits, symbols } from 'secure-random-password'

/**
 * @desc {key:value,...}转换成[{value，label}]
 * @params keyToNumber是否转换为number类型
 */
export const mapToKeyValueArray = (map: Record<string, any>, keyToNumber = false) => {
  return Object.entries(map).map(([key, value]) => {
    return {
      value: keyToNumber && !isNaN(Number(key)) ? Number(key) : key,
      label: value,
    }
  })
}

export const generateRamArray = (minValue, maxValue) => {
  const result: any[] = [
    {
      value: '',
      label: t('ins.custom.allRam'), // 全部内存
    },
  ]
  let value = minValue

  while (value <= maxValue) {
    result.push({
      value: value,
      label: `${value}GB`,
    })
    value *= 2 // 每次将 value 乘以 2
  }

  return result
}

// 生成密码函数
export const generatePassword = (REG: RegExp) => {
  // 随机生成一个密码
  let password = randomPassword({
    length: 8 + Math.floor(Math.random() * 25),
    characters: lower + upper + digits + symbols,
  })

  // 检查密码是否符合
  if (!REG.test(password)) {
    password = generatePassword(REG)
  }

  return password
}
