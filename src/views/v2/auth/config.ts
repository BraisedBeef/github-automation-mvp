import { pickObjectProperties } from '@/utils/collection-utils'

export const EMIAL_REG = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // 邮箱正则

const specialCharacters = '!@#$%^&*()_+~`|}{[\\]:;?><,./-'
const regexString = `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}])[a-zA-Z0-9${specialCharacters}]{8,32}$`
export const PWD_REG = new RegExp(regexString) // 密码正则

// 添加用户信息cookie (用于官网同步用户信息)
export function addUserInfoCookie(obj) {
  const arr = [
    'accountType',
    'appId',
    'contactEmail',
    'createDate',
    'email',
    'headImg',
    'id',
    'langCode',
    'remark',
    'state',
    'userName',
    'userNum',
    'userType',
  ]
  return pickObjectProperties(obj || {}, arr)
}
