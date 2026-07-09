export const SSH_KEY_NAME_LEN_MIN = 1
export const SSH_KEY_NAME_LEN_MAX = 25
export const SSH_KEY_NAME_REGEX = new RegExp(`^[A-Za-z0-9_]{${SSH_KEY_NAME_LEN_MIN},${SSH_KEY_NAME_LEN_MAX}}$`) // ssh名称正则

// 是否可以删除
export const isDelete = (bindInsNum: number) => {
  return bindInsNum === 0
}

// 是否可以删除(批量)
export const isDeleteBatch = (bindInsNumList: number[]) => {
  return bindInsNumList.length ? bindInsNumList.every(el => isDelete(el)) : false
}

// 是否能解绑实例
export const isUnBindIns = (insState: string) => {
  return ['STOPPED', 'RUNNING'].includes(insState)
}

// 是否能解绑实例(批量)
export const isUnBindInsBatch = (insStateList: string[]) => {
  return insStateList.length ? insStateList.every(el => isUnBindIns(el)) : false
}

// 绑定实例列表状态
export const isShowBindInsInsList = (state: string) => {
  return ['STOPPED', 'RUNNING', 'BAND_SSH_ING', 'UNBAND_SSH_ING'].includes(state)
}
