import {
  _listByRegionId,
  _getListWithRegion,
  _getListWithRegionByWhitelist,
  _getAllZoneList,
  _getQuickCreateDefaultZone,
  _createVpc,
} from '@/apis/cvm/base'
import { _getUserProject } from '@/apis/account-system/user'

/**
 * @name 基础配置
 */
export const useBaseConfig = () => {
  const loading = ref<boolean>(false)

  // 获取大区列表及其地区
  const getListWithRegion = async (cb?: (p: any) => void) => {
    try {
      const res = await _getListWithRegion()
      console.log(`_getListWithRegion===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 获取大区列表及其地区 （白名单版本）
  const getListWithRegionByWhitelist = async (cb?: (p: any) => void) => {
    try {
      const res = await _getListWithRegionByWhitelist()
      console.log(`_getListWithRegionByWhitelist===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 根据地区id获取可用区列表
  const listByRegionId = async (params: any, cb?: (p: any) => void) => {
    try {
      const res = await _listByRegionId(params)
      console.log(`_listByRegionId===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 用户项目列表
  const getUserProject = async (params: any, cb?: (p: any) => void) => {
    loading.value = true
    try {
      const res = await _getUserProject(params)
      console.log(`_getUserProject===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  // 查询所有可用区
  const getAllZoneList = async (cb?: (p: any) => void) => {
    try {
      const res = await _getAllZoneList()
      console.log(`_getAllZoneList===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 查询快速创建默认可用区
  const getQuickCreateDefaultZone = async (params: any, cb?: (p: any) => void) => {
    try {
      const res = await _getQuickCreateDefaultZone(params)
      console.log(`_getQuickCreateDefaultZone===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  // 创建默认VPC
  const createVpc = async (params: any, cb?: (p: any) => void) => {
    try {
      const res = await _createVpc(params)
      console.log(`_createVpc===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    }
  }

  return {
    loading,
    getUserProject,
    listByRegionId,
    getListWithRegion,
    getListWithRegionByWhitelist,
    getAllZoneList,
    getQuickCreateDefaultZone,
    createVpc,
  }
}
