import { OSS_STORE } from '@/config/constant-config'
import { db } from '@/views/oss/utils/upload-db'
import { defineStore } from 'pinia'

export default defineStore(OSS_STORE, {
  state: () => {
    return {
      folders: [] as string[], // 添加folders状态
      bucketInfo: {} as any, // 存储桶信息
      hasTasks: false, // 任务中心是否有任务
    }
  },
  actions: {
    // 添加更新folders的方法
    updateFolders(newFolders: string[]) {
      this.folders = newFolders
    },
    // 添加更新bucketInfo的方法
    updateBucketInfo(newBucketInfo: any) {
      this.bucketInfo = newBucketInfo
    },
    // 添加清空bucketInfo的方法
    clearBucketInfo() {
      this.bucketInfo = {}
    },
    // 添加清空folders的方法
    clearFolders() {
      this.folders = []
    },
    // 任务中心数据
    async checkHasTasks() {
      const tasks = await db.tasks.toArray()
      this.hasTasks = tasks && tasks.length > 0
      return this.hasTasks
    },
    // 清空任务中心数据
    async clearTasks() {
      await db.tasks.clear()
      await db.subtasks.clear()
      this.clearFolders()
      this.clearBucketInfo()
      this.hasTasks = false
    },
  },
  getters: {},
  persist: true, // 保持持久化存储
})
