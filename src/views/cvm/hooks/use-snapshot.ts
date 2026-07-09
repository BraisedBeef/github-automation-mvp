import { _getSnapshotList } from '@/apis/cvm/snapshot'

/**
 * @name 快照
 */
export const useSnapshot = () => {
  const loading = ref<boolean>(false)

  // 快照列表
  const getSnapshotList = async (params: any, cb?: (p: any) => void) => {
    try {
      loading.value = true

      const res = await _getSnapshotList(params)
      console.log(`_getSnapshotList===>`, res)
      cb?.(res)
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getSnapshotList,
  }
}
