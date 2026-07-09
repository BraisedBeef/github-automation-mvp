// services/task-manager.ts
import WebSocketService from '@/request/ws'
import { Task, TaskStatus, TaskCommand, TaskMessage, TaskType, ActionType, TaskInfo } from '../types'
import { db } from './upload-db'
import t from '@/utils/i18n'
import { getDateDayjs, maoYunDayJs } from '@/utils/mao-yun-day-js'

export default class TaskManager {
  private wsService: WebSocketService | null = null

  // 任务列表
  private tasks = reactive<Map<string, any>>(new Map())

  // 处理中的任务锁，防止并发导致 index 重复
  private processingLocks = new Map<string, Promise<void>>()

  // 状态
  private state = reactive({
    connected: false,
    loading: false,
    error: null as string | null,
    lastUpdate: null as number | null,
  })

  // 事件监听器 - 使用 Set 提高查找和删除效率
  private listeners = {
    onTaskUpdate: new Set<(task: Task) => void>(),
    onTaskAdd: new Set<(task: Task) => void>(),
    onTaskDelete: new Set<(taskId: string) => void>(),
    onStatusChange: new Set<(connected: boolean) => void>(),
  }

  constructor(private wsUrl: string) {
    this.initWebSocket()
  }

  /**
   * 初始化 WebSocket 连接
   */
  private initWebSocket(): void {
    this.wsService = new WebSocketService({
      url: this.wsUrl,
      reconnectLimit: 3,
      reconnectInterval: 5000,
      heartInterval: 50000,

      onOpen: event => {
        this.state.connected = true
        this.state.error = null
        this.listeners.onStatusChange.forEach(cb => cb(true))
      },

      onMessage: (data: TaskMessage) => {
        this.handleMessage(data)
      },

      onClose: event => {
        this.state.connected = false
        this.state.lastUpdate = Date.now()
        this.listeners.onStatusChange.forEach(cb => cb(false))
      },

      onError: event => {
        console.error('任务管理器连接错误', event)
        this.state.error = '连接失败，请检查网络'
      },

      onReconnect: count => {
        console.log(`任务管理器第 ${count} 次重连`)
        this.state.error = `正在尝试重新连接... (${count})`
      },
    })
  }

  /**
   * 处理 WebSocket 消息
   */
  private async handleMessage(message: TaskMessage) {
    const task = this.tasks.get(message.taskId)
    if (!task) return

    // 使用锁机制确保同一任务的消息处理是串行化的，避免 index 重复
    const lockKey = `task_${message.taskId}`
    const currentLock = this.processingLocks.get(lockKey)

    let resolveLock: () => void = () => {}
    const newLock = new Promise<void>(resolve => {
      resolveLock = resolve
    })
    this.processingLocks.set(lockKey, newLock)

    // 等待前一个消息处理完成
    if (currentLock) {
      await currentLock
    }

    try {
      await this.processMessage(message, task)
    } finally {
      resolveLock()
      // 清理已完成的锁
      if (this.processingLocks.get(lockKey) === newLock) {
        this.processingLocks.delete(lockKey)
      }
    }
  }

  /**
   * 实际处理消息的逻辑
   */
  private async processMessage(message: TaskMessage, task: any) {
    if (!task.isAddTask) {
      switch (message.status) {
        case 'complete': {
          this.listeners.onTaskUpdate.forEach(cb => cb(message as any))
          this.listeners.onTaskUpdate.clear()
          break
        }
      }
    }

    const data: any = message.data || {}
    switch (message.status) {
      case 'progress': {
        await db.tasks.update(task.dbId, {
          taskNumber: data.total_status.total || 0,
          tasking: data.total_status.success + data.total_status.failed || 0,
          // 成功数
          success: data.total_status.success || 0,
          // 失败数
          failed: data.total_status.failed || 0,
        })

        if (data.details && data.details.length) {
          const status = {
            progress: TaskStatus.EXECUTING,
            success: TaskStatus.SUCCESS,
            failed: TaskStatus.CANCELLED,
          }

          task.subtasks = task.subtasks || []

          // 高效查询最大 index - 使用 last() 而不是遍历数组
          const lastSubtask = await db.subtasks.where('taskId').equals(task.dbId).last()
          let maxIndex = lastSubtask?.index ?? -1

          // 缓存已存在的子任务 key -> index 映射，避免重复 O(n) 查找
          const keyIndexMap = new Map<string, number>()
          task.subtasks.forEach((s: any, idx: number) => {
            if (s?.key) keyIndexMap.set(s.key, idx)
          })

          for (let i = 0; i < data.details.length; i++) {
            const fi = data.details[i]
            const existingIndex = keyIndexMap.get(fi.key)

            try {
              if (existingIndex !== undefined) {
                const existing = task.subtasks[existingIndex]

                const updateData = {
                  size: fi.size,
                  progress: status[fi.status] !== TaskStatus.EXECUTING ? 100 : 0,
                  status: status[fi.status],
                  index: existing.index,
                }

                if (existing.subtaskId) {
                  await db.subtasks.update(existing.subtaskId, updateData)
                } else {
                  const subId = await db.subtasks.add({
                    ...updateData,
                    taskId: task.dbId,
                    key: fi.key,
                    type: task.type,
                    tid: message.taskId,
                  })
                  existing.subtaskId = subId
                }

                // 更新内存数据，保留 index 和 subtaskId
                Object.assign(existing, fi, { index: existing.index, subtaskId: existing.subtaskId })
              } else {
                const newIndex = ++maxIndex
                const subId = await db.subtasks.add({
                  taskId: task.dbId,
                  key: fi.key,
                  size: fi.size,
                  progress: status[fi.status] !== TaskStatus.EXECUTING ? 100 : 0,
                  status: status[fi.status],
                  index: newIndex,
                  type: task.type,
                  tid: message.taskId,
                })

                task.subtasks.push({ ...fi, subtaskId: subId, index: newIndex })
                keyIndexMap.set(fi.key, task.subtasks.length - 1)
              }
            } catch (e) {
              console.error('add/update subtask error', e)
            }
          }
        }
        break
      }
      case 'complete': {
        const status = TaskStatus.SUCCESS
        await db.tasks.update(task.dbId, {
          status,
          progress: 100,
          taskNumber: data.total_status.total || 0,
          tasking: data.total_status.success + data.total_status.failed || 0,
          success: data.total_status.success || 0,
          failed: data.total_status.failed || 0,
        })
        this.listeners.onTaskUpdate.forEach(cb => cb(message as any))
        this.listeners.onTaskUpdate.clear()

        break
      }
    }
  }

  /**
   * 处理任务添加
   */
  private async handleTaskAdd(
    taskId: string,
    info: { dbId: number; subtasks?: Task[]; isAddTask?: boolean; type: ActionType },
  ) {
    this.tasks.set(taskId, info)
  }

  /**
   * 发送命令到服务器
   */
  private sendCommand(command: TaskCommand): boolean {
    if (!this.wsService || !this.state.connected) {
      console.error('无法发送命令：WebSocket 未连接')
      return false
    }

    const message = {
      ...command,
    }

    return this.wsService.send(message)
  }

  /**
   * 公共方法
   */

  // 发送消息并且添加任务
  public async addTask(taskInfo: TaskInfo) {
    // this.sendCommand({ type: taskInfo.type, taskId: taskInfo.taskId })
    let id = 0
    if (!taskInfo.isAddTask) {
      console.log('任务添加完成:')
      // 生成任务名：删除对象任务-年月日时分秒
      const pad = (n: number) => String(n).padStart(2, '0')
      const now = new Date()
      const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(Number(getDateDayjs(maoYunDayJs())))}${pad(
        now.getHours(),
      )}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      let taskName = ''
      switch (taskInfo.type) {
        case TaskType.CLEAR_BUCKET:
          taskName = t('oss.fileList.deleteObjectTask', [ts])
          break
        case TaskType.BATCH_DELETE:
          taskName = t('oss.fileList.deleteObjectTask', [ts])
          break
        case TaskType.BATCH_UPDATE_ACL:
          taskName = t('oss.fileList.modifyAccessPermissionTask', [ts])
          break
        case TaskType.BATCH_UPDATE_ENCRYPTION:
          taskName = t('oss.fileList.modifyEncryptionMethodTask', [ts])
          break
        case TaskType.COPY_OBJECT:
          taskName = t('oss.fileList.copyTask', [ts])
          break
      }

      id = await db.tasks.add({
        taskName,
        status: TaskStatus.EXECUTING, // 1=执行中
        progress: 0,
        tasking: 0, // 已完成文件数
        taskNumber: taskInfo.taskNumber || 0, // 总文件数
        // 成功数
        success: 0,
        // 失败数
        failed: 0,
        type: taskInfo.type, // 任务类型
        tid: taskInfo.taskId, // 接口返回的任务 ID，后续发消息用
      })
    }
    this.handleTaskAdd(taskInfo.taskId, {
      dbId: id,
      subtasks: taskInfo.subtasks,
      isAddTask: taskInfo.isAddTask,
      type: taskInfo.type,
    })
  }

  // 取消任务
  public cancelTask(taskId: string): boolean {
    return this.sendCommand({
      type: 'task_action',
      taskId,
      action: 'cancel',
    })
  }

  // 暂停任务
  // public pauseTask(taskId: string): boolean {
  //   return this.sendCommand({
  //     type: 'pause',
  //     taskId,
  //   })
  // }

  // 启动/恢复任务
  // public startTask(taskId: string): boolean {
  //   return this.sendCommand({
  //     type: 'start',
  //     taskId,
  //   })
  // }

  // 重试任务
  // public retryTask(taskId: string): boolean {
  //   return this.sendCommand({
  //     type: 'retry',
  //     taskId,
  //   })
  // }

  // 删除任务数量
  public deleteTaskTotal(taskId: string, action): boolean {
    return this.sendCommand({
      type: 'task_del_total',
      taskId,
      action,
      data: {
        num: 1,
      },
    })
  }

  // 获取单个任务
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId)
  }

  // 事件监听
  public onTaskUpdate(callback: (task: Task) => void): void {
    this.listeners.onTaskUpdate.add(callback)
  }

  public onTaskAdd(callback: (task: Task) => void): void {
    this.listeners.onTaskAdd.add(callback)
  }

  public onTaskDelete(callback: (taskId: string) => void): void {
    this.listeners.onTaskDelete.add(callback)
  }

  public onStatusChange(callback: (connected: boolean) => void): void {
    this.listeners.onStatusChange.add(callback)
  }

  // 移除事件监听
  public offTaskUpdate(callback: (task: Task) => void): void {
    this.listeners.onTaskUpdate.delete(callback)
  }

  // 重新连接
  public reconnect(): void {
    this.wsService?.connect()
  }

  // 断开连接
  public disconnect(): void {
    this.wsService?.close()
  }

  // 销毁
  public destroy(): void {
    this.wsService?.destroy()
    this.tasks.clear()
    this.processingLocks.clear()
    this.listeners.onTaskUpdate.clear()
    this.listeners.onTaskAdd.clear()
    this.listeners.onTaskDelete.clear()
    this.listeners.onStatusChange.clear()
  }

  // 状态访问器
  public get isConnected(): boolean {
    return this.state.connected
  }

  public get isLoading(): boolean {
    return this.state.loading
  }

  public get error(): string | null {
    return this.state.error
  }

  public get lastUpdate(): number | null {
    return this.state.lastUpdate
  }

  public get allTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  public get taskCount(): number {
    return this.tasks.size
  }
}
