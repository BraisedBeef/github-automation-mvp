import t from '@/utils/i18n'

// 镜像状态 1 正常 2 停用 3 构建中 4 构建失败
export const IMAGE_STATE_MAP = {
  1: t('image.config.normal'), // 正常
  2: t('image.config.discontinue'), // 停用
  3: t('image.config.building'), // 构建中
  4: t('image.config.buildFail'), // 构建失败
}

// 镜像名称正则
export const IMAGE_NAME_REG = /^[\u4e00-\u9fa5a-zA-Z0-9-_.]{1,60}$/

// 镜像类型
export const IMAGE_TYPE_MAP = {
  1: t('image.config.common'),
  2: t('image.config.custom'),
}

// 镜像类型
export const IMAGE_TYPE_ARR_MAP = [
  { label: t('image.config.common'), value: 1 }, // 公共镜像
  { label: t('image.config.custom'), value: 2 }, // 自定义镜像
]

// 镜像平台
export const IMAGE_PLATFORM_FILTER_ARR_MAP = [
  { label: 'CentOS', value: 'CentOS' },
  { label: 'Windows', value: 'Windows' },
  { label: 'Ubuntu', value: 'Ubuntu' },
  { label: 'Debian', value: 'Debian' },
  { label: 'Huawei Cloud EulerOS', value: 'Huawei Cloud EulerOS' },
  { label: 'SUSE', value: 'SUSE' },
  { label: 'EulerOS', value: 'EulerOS' },
  { label: 'OpenSUSE', value: 'OpenSUSE' },
  { label: 'KylinSec', value: 'KylinSec' },
  { label: 'KylinOS', value: 'KylinOS' },
  { label: 'AlmaLinux', value: 'AlmaLinux' },
  { label: 'Rocky Linux', value: 'Rocky Linux' },
  { label: 'UnionTechOS', value: 'UnionTechOS' },
  { label: 'CentOS Stream', value: 'CentOS Stream' },
  { label: 'openEuler', value: 'openEuler' },
  { label: 'TencentOS', value: 'TencentOS' },
  { label: 'OpenCloudOS', value: 'OpenCloudOS' },
  { label: 'Red Hat', value: 'Red Hat' },
  { label: 'CoreOS', value: 'CoreOS' },
  { label: 'FreeBSD', value: 'FreeBSD' },
  { label: 'Fedora', value: 'Fedora' },
  { label: 'UOS', value: 'UOS' },
  { label: 'Linux', value: 'Linux' },
  { label: 'SUSESAP', value: 'SUSESAP' },
  { label: 'Rocky', value: 'Rocky' },
]

// 是否能创建实例
export const isCreateIns = (state: number) => {
  return [1].includes(state)
}

// 是否能创建实例(批量)
export const isCreateInsBatch = (stateList: number[]) => {
  if (stateList.length && stateList.length === 1) {
    return stateList.every(el => isCreateIns(el))
  } else {
    return false
  }
}

// 是否能删除
export const isDelete = (state: number) => {
  return [1].includes(state)
}

// 是否能修改
export const isModify = (state: number) => {
  return [1].includes(state)
}

export const imageDescLen = 256
