// composables/useTaskManager.ts
import { TaskInfo } from '../types'
import TaskManager from '../utils/task-manager'
import { httpUrl } from '@/config/base-config'

// 单例模式管理 TaskManager 实例
let taskManagerInstance: TaskManager | null = null

function getTaskManagerInstance(): TaskManager {
  if (!taskManagerInstance) {
    taskManagerInstance = new TaskManager(`${httpUrl}/oss/task/status`)
  }
  return taskManagerInstance
}

// 清空实例（用于断开连接时）
export function clearTaskManagerInstance() {
  if (taskManagerInstance) {
    taskManagerInstance.disconnect()
    taskManagerInstance.destroy()
  }
  taskManagerInstance = null
}

export function useTaskManager() {
  // 创建任务管理器实例
  const taskManager = getTaskManagerInstance()

  // 任务操作
  const addTask = (taskInfo: TaskInfo, onTaskComplete?) => {
    console.log('addTask', taskInfo)
    onTaskComplete && taskManager.onTaskUpdate(onTaskComplete)
    return taskManager.addTask(taskInfo)
  }
  /**
   * 取消指定ID的任务
   * @param taskId - 要取消的任务的唯一标识符
   * @returns 返回任务管理器取消任务的结果
   */
  const cancelTask = (taskId: string) => {
    return taskManager.cancelTask(taskId) // 调用任务管理器的取消任务方法，并传入任务ID
  }

  const pauseTask = (taskId: string) => {
    // return taskManager.pauseTask(taskId)
  }

  const startTask = (taskId: string) => {
    // return taskManager.startTask(taskId)
  }

  const retryTask = (taskId: string) => {
    // return taskManager.retryTask(taskId)
  }

  const deleteTaskTotal = (taskId: string, action: 'del_success' | 'del_failed') => {
    return taskManager.deleteTaskTotal(taskId, action)
  }

  // 重新连接
  const reconnect = () => {
    taskManager.reconnect()
  }

  // 断开连接
  const disconnect = () => {
    taskManager.disconnect()
    taskManagerInstance = null
  }

  // 组件卸载时清理
  onUnmounted(() => {
    // taskManager.destroy()
  })

  // 立即更新一次任务列表
  setTimeout(() => {
    // refreshTasks()
  }, 100)

  return {
    // 操作方法
    addTask,
    cancelTask,
    pauseTask,
    startTask,
    retryTask,
    deleteTaskTotal,
    reconnect,
    disconnect,
  }
}
