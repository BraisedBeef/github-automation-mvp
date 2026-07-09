import COS from 'cos-js-sdk-v5'
import { db } from './upload-db'
// import { _uploadCallback } from '@/apis/oss/storage-list'
import { events } from '../../../utils/mitt'

import { _debounce } from '@/utils/timing-utils'
import t from '@/utils/i18n'
import { notify } from '@/utils/notification'

type FileItem = {
  file: any
  key: string
  cos?: any
  taskId?: string
  taskRef?: any
  subtaskId?: number
  started?: boolean
  uploading?: boolean
  finished?: boolean
  paused?: boolean
  isFolder?: boolean
}

type TaskController = {
  id: number
  files: FileItem[]
  sts: any
  bucketName: string // 用于上传回调，请求自己的接口不用带后缀-appid，请求 COS 接口才需要带后缀-appid
  bucket: string
  region: string
  headers?: any
  status: TaskStatusType // 1 executing,2 paused,3 cancelled/failed,4 success
  successCount: number
  failCount: number
  lastUploadedFiles: { key: string; size: number }[]
  queue?: AsyncQueue | null
}

// 状态管理相关常量
const TaskStatus = {
  /** 执行中 */
  EXECUTING: 1,
  /** 暂停 */
  PAUSED: 2,
  /** 取消/失败 */
  CANCELLED: 3,
  /** 成功 */
  SUCCESS: 4,
} as const

type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus]

const BATCH_SIZE = 30 // 每批处理N个文件
const CONCURRENCY = 3 // 同时上传N个文件

// 状态管理工具函数
// 初始化任务状态，创建子任务记录
const initializeSubtasks = async (taskId: number, files: FileItem[]) => {
  for (let i = 0; i < files.length; i++) {
    const fi = files[i]
    if (fi.isFolder) continue
    try {
      const subId = await db.subtasks.add({
        taskId,
        key: fi.key,
        size: fi.file?.size ?? 0,
        progress: 0,
        status: TaskStatus.EXECUTING,
        index: i,
      })
      fi.subtaskId = subId
    } catch (e) {
      console.log('add subtask error', e)
    }
  }
}

// 更新主任务状态
const updateTaskStatus = async (taskId: number, status: TaskStatusType) => {
  await db.tasks.update(taskId, { status }).catch(() => {})
}
// 更新子任务状态
const updateSubtaskStatus = async (subtaskId: number, status: TaskStatusType, progress?: number) => {
  const updateData: any = { status }
  if (progress !== undefined) {
    updateData.progress = progress
  }
  await db.subtasks.update(subtaskId, updateData).catch(() => {})
}
/**
 * 检查并更新任务的整体状态
 * 该函数会检查任务的所有子任务状态，根据子任务的状态更新主任务的状态
 * @param taskId - 要检查的任务ID
 */
const checkAndUpdateOverallStatus = async (taskId: number) => {
  // 获取任务控制器
  const ctl = controllers.get(taskId)
  // 如果不存在控制器，则直接返回
  if (!ctl) return
  // 需要等待任务队列batchProcessFiles全部执行完毕再执行

  // 从数据库中获取指定任务的所有子任务
  const subtasks = await db.subtasks.where('taskId').equals(taskId).toArray()

  // 检查是否有子任务被取消，如果有则将主任务状态设为取消
  if (subtasks.some(sub => sub.status === TaskStatus.EXECUTING)) {
    ctl.status = TaskStatus.EXECUTING
  } else if (subtasks.some(sub => sub.status === TaskStatus.CANCELLED)) {
    ctl.status = TaskStatus.CANCELLED
  } else if (subtasks.every(sub => sub.status === TaskStatus.SUCCESS)) {
    ctl.status = TaskStatus.SUCCESS
  } else if (subtasks.filter(sub => sub.status !== TaskStatus.SUCCESS).every(sub => sub.status === TaskStatus.PAUSED)) {
    ctl.status = TaskStatus.PAUSED
  }
  await updateTaskStatus(taskId, ctl.status)
}

// 递归收集所有文件夹和文件，文件夹优先
function flattenFilesAndFolders(items: any[], currentPath = '', prefix = ''): FileItem[] {
  const result: FileItem[] = []
  for (const item of items) {
    if (item.status !== 'success') continue
    if (item.isFolder) {
      const folderKey = `${prefix}${currentPath}${item.name}/`
      result.push({
        file: null,
        key: folderKey,
        isFolder: true,
        finished: false,
        paused: false,
        started: false,
        uploading: false,
      })
      if (item.files && item.files.length) {
        result.push(...flattenFilesAndFolders(item.files, `${currentPath}${item.name}/`, prefix))
      }
    } else {
      const fileKey = `${prefix}${currentPath}${item.name}`
      result.push({
        file: item.raw ?? item,
        key: fileKey,
        isFolder: false,
        finished: false,
        paused: false,
        started: false,
        uploading: false,
      })
    }
  }
  return result
}

/**
 * 从STS(Security Token Service)响应中提取凭证信息
 * @param sts - 包含凭证信息的STS响应对象
 * @returns 返回包含提取的凭证信息的对象，如果输入为null则返回null
 */
function getCredFromSts(sts: any) {
  if (!sts) return null
  const cred = sts.Credentials ?? sts.credentials ?? sts
  const TmpSecretId = cred.TmpSecretId ?? cred.tmpSecretId ?? cred.TmpId ?? cred.AccessKeyId ?? cred.AccessKey
  const TmpSecretKey = cred.TmpSecretKey ?? cred.tmpSecretKey ?? cred.SecretAccessKey ?? cred.SecretKey
  const SecurityToken = cred.SecurityToken ?? cred.Token ?? cred.sessionToken ?? cred.session ?? cred.securityToken
  const StartTime = cred.StartTime ?? cred.startTime
  const ExpiredTime = cred.ExpiredTime ?? cred.expiredTime
  return { TmpSecretId, TmpSecretKey, SecurityToken, StartTime, ExpiredTime }
}

// 构建 Headers
function buildHeaders(headers?: any): any {
  const result: any = {}
  if (headers?.['x-oss-acl'] && headers['x-oss-acl'] !== 'default') {
    result['x-cos-acl'] = headers['x-oss-acl']
  }
  if (headers?.['x-oss-server-side-encryption'] && headers['x-oss-server-side-encryption'] !== 'default') {
    result['x-cos-server-side-encryption'] = headers['x-oss-server-side-encryption']
  }
  return result
}

const cosInstances = new Map<number, any>()
// 原有的控制器和实例管理
const controllers = new Proxy(new Map<number, TaskController>(), {
  set(target, key, value) {
    const result = Reflect.set(target, key, value)
    if (target.size === 0) {
      clearTaskList()
    }
    return result
  },
  deleteProperty(target, key) {
    const result = Reflect.deleteProperty(target, key)
    if (target.size === 0) {
      clearTaskList()
    }
    return result
  },
  get(target, key) {
    if (typeof target[key] === 'function') {
      return target[key].bind(target)
    }
    return Reflect.get(target, key)
  },
})

// COS 操作工具函数
const createCosInstance = (cred: any) => {
  return new COS({
    getAuthorization: function (_options: any, callback: any) {
      const auth: any = {
        TmpSecretId: cred.TmpSecretId,
        TmpSecretKey: cred.TmpSecretKey,
        SecurityToken: cred.SecurityToken,
      }
      if (typeof cred.StartTime !== 'undefined') auth.StartTime = cred.StartTime
      if (typeof cred.ExpiredTime !== 'undefined') auth.ExpiredTime = cred.ExpiredTime
      callback(auth)
    },
  })
}
async function handleCosOperation(operation: 'pause' | 'cancel' | 'restart', taskId: string, cos: any) {
  const methodName = `${operation}Task`
  if (taskId && cos && typeof cos[methodName] === 'function') {
    try {
      await cos[methodName](taskId)
    } catch (e) {
      console.log(`${methodName} error`, e)
      throw e
    }
  }
}

// 并发队列工具类
type QueueTask = {
  id: number // subtaskId
  run: () => Promise<void>
  status: 'pending' | 'running' | 'paused' | 'cancelled' | 'finished'
}

class AsyncQueue {
  private concurrency: number
  private running = 0
  private queue: QueueTask[] = []
  private runningTasks: Map<number, { task: QueueTask; abort: (() => void) | null }> = new Map()
  private aborted = false

  constructor(concurrency: number) {
    this.concurrency = concurrency
  }

  setAborted() {
    this.aborted = true
    this.queue = []
    this.runningTasks.clear()
  }

  reset() {
    this.aborted = false
    this.queue = []
    this.runningTasks.clear()
    this.running = 0
  }

  add(task: QueueTask) {
    if (this.aborted) return
    this.queue.push(task)
    this.runNext()
  }

  pauseTask(taskId: number) {
    // 1. 如果在等待队列，直接标记为 paused
    const task = this.queue.find(t => t.id === taskId)
    if (task && task.status === 'pending') {
      task.status = 'paused'
      return
    }
    // 2. 如果正在执行，强制中断并移出 runningTasks，标记为 paused
    const running = this.runningTasks.get(taskId)
    if (running && running.task.status === 'running') {
      running.task.status = 'paused'
      // 调用 abort（如果有），否则直接移除
      running.abort?.()
      this.runningTasks.delete(taskId)
      this.running--
      this.runNext()
    }
  }

  resumeTask(taskId: number) {
    // 只恢复 paused 状态的任务
    const task = this.queue.find(t => t.id === taskId)
    if (task && task.status === 'paused') {
      task.status = 'pending'
      this.runNext()
    }
  }

  cancelTask(taskId: number) {
    // 1. 从等待队列移除
    const idx = this.queue.findIndex(t => t.id === taskId)
    if (idx > -1) {
      this.queue.splice(idx, 1)
    }
    // 2. 如果正在执行，强制中断并移出 runningTasks
    const running = this.runningTasks.get(taskId)
    if (running) {
      running.task.status = 'cancelled'
      running.abort?.()
      this.runningTasks.delete(taskId)
      this.running--
      this.runNext()
    }
  }

  private runNext() {
    while (this.running < this.concurrency && this.queue.length && !this.aborted) {
      // 查找下一个 pending 状态的任务
      const idx = this.queue.findIndex(t => t.status === 'pending')
      if (idx === -1) break // 没有可执行任务，直接退出
      const task = this.queue[idx]
      this.queue.splice(idx, 1)
      task.status = 'running'
      this.running++
      // 支持外部中断
      let aborted = false
      const abort = () => {
        aborted = true
      }
      this.runningTasks.set(task.id, { task, abort })
      task
        .run()
        .catch(() => {})
        .finally(() => {
          this.runningTasks.delete(task.id)
          this.running--
          if (!aborted && task.status !== 'paused' && task.status !== 'cancelled') {
            task.status = 'finished'
          }
          this.runNext()
        })
    }
  }

  async drain() {
    while ((this.running > 0 || this.queue.some(t => t.status === 'pending')) && !this.aborted) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

// const queue = new AsyncQueue(CONCURRENCY)
// 批量并发处理工具
async function batchProcessFiles(
  files: FileItem[],
  handler: (fi: FileItem) => Promise<void> | void,
  queueRef?: AsyncQueue | null,
  options?: { sync?: boolean; batchSize?: number },
) {
  // 使用传入的批次大小或默认值
  const batchSize = options?.batchSize || BATCH_SIZE

  // 同步模式：直接分批处理，不使用队列
  if (options?.sync || !queueRef) {
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)

      // 并行执行批次内的文件处理（不使用队列控制）
      await Promise.all(
        batch.map(async fi => {
          try {
            await handler(fi)
          } catch (e) {
            console.log('batch process error', e)
            // 可以记录错误但继续处理其他文件
          }
        }),
      )
    }
    return
  }

  // 异步模式：使用队列（原有逻辑）
  const queue = queueRef
  let aborted = false
  let error: any = null

  for (let i = 0; i < files.length; i += batchSize) {
    if (aborted) break
    const batch = files.slice(i, i + batchSize)

    await Promise.all(
      batch.map(
        fi =>
          new Promise<void>(resolve => {
            if (aborted) return resolve()
            queueRef?.add({
              id: fi.subtaskId!,
              status: 'pending',
              run: async () => {
                if (aborted || queueRef['aborted']) return resolve()
                try {
                  await handler(fi)
                } catch (e) {
                  aborted = true
                  error = e
                  queueRef?.setAborted()
                }
                resolve()
              },
            })
          }),
      ),
    )
    batch.length = 0
    if (aborted) break
  }

  await queue.drain()
  if (aborted && error) throw error
}

// 主要功能函数
async function createAndStartTask(
  taskId: number,
  filesRaw: any[],
  sts: any,
  headers?: any,
  prefix: string = '',
  bucketName: string = '',
) {
  if (!taskId) return
  // 递归展开所有文件夹和文件，文件夹优先
  const files: FileItem[] = flattenFilesAndFolders(filesRaw, '', prefix).filter(fi => !fi.isFolder)

  const controller: TaskController = {
    id: taskId,
    files,
    sts,
    bucket: sts.bucketName,
    bucketName: bucketName || sts.bucketName,
    region: sts.region,
    headers: headers || {},
    status: TaskStatus.EXECUTING,
    successCount: 0,
    failCount: 0,
    lastUploadedFiles: [],
    queue: new AsyncQueue(CONCURRENCY),
  }
  controllers.set(taskId, controller)

  await initializeSubtasks(taskId, files)
  // 更新任务总数
  await db.tasks.update(taskId, { taskNumber: files.filter(fi => !fi.isFolder).length }).catch(() => {})
  await startTask(taskId)
}

// 处理单个文件的上传
async function handleFileUpload(fi: FileItem, ctl: TaskController): Promise<void> {
  if (fi.finished) return
  try {
    if (fi.started && fi.paused && fi.taskId) {
      await handlePausedFile(fi, ctl)
    } else if (fi.started && fi.uploading) {
      await handleUploadingFile(fi)
    } else if (!fi.started) {
      await handleNewFile(fi, ctl)
    }
  } catch (error) {
    console.log(`Error handling file ${fi.key}:`, error)
    await handleUploadError(error, fi, ctl)
    throw error
  }
}

// 错误处理工具函数
const handleUploadError = async (error: any, fi: FileItem, ctl: TaskController) => {
  console.log(`upload error for taskId ${ctl.id}`, error)
  if (error?.message?.startsWith('CORS blocked or network error')) {
    notify.error(t('oss.s7.checkNetworkOrCrossDomainSettings'))
    updateTaskStatus(ctl.id, TaskStatus.CANCELLED)
    await Promise.all(
      ctl.files
        .filter(f => !f.finished)
        .map(f => f.subtaskId && updateSubtaskStatus(f.subtaskId, TaskStatus.CANCELLED)),
    )
    return
  }
  if (fi.subtaskId) {
    // 如果err.message = The specified multipart upload does not exist.The upload ID might be invalid, or the multipart upload might have been aborted or completed. 需要对这个文件进行重新上传
    if (error?.message?.includes('The specified multipart upload does not exist')) {
      await handleFileUpload(fi, ctl)
      return
    }
    await updateSubtaskStatus(fi.subtaskId, TaskStatus.CANCELLED)
  }
}

// 处理已暂停的文件
async function handlePausedFile(fi: FileItem, ctl: TaskController): Promise<void> {
  if (!fi.cos) return

  try {
    await handleCosOperation('restart', fi.taskId!, fi.cos)
    fi.paused = false
    fi.uploading = true
    await updateSubtaskStatus(fi.subtaskId!, TaskStatus.EXECUTING)
  } catch (error) {
    console.log('restartTask error', error)
    fi.uploading = false
  }
}

// 处理正在上传的文件
async function handleUploadingFile(fi: FileItem): Promise<void> {
  await waitForUploadComplete(fi)
}

// 处理新文件
async function handleNewFile(fi: FileItem, ctl: TaskController): Promise<void> {
  if (!fi.cos) return

  fi.started = true
  fi.uploading = true

  const headers = buildHeaders(ctl.headers)
  if (fi.subtaskId) {
    updateSubtaskStatus(fi.subtaskId!, TaskStatus.EXECUTING)
  }

  try {
    const data = await fi.cos.uploadFile({
      Bucket: ctl.bucket,
      Region: ctl.region,
      Key: fi.key,
      Body: fi.file || '',
      SliceSize: 8 * 1024 * 1024,
      Headers: headers,
      onTaskReady: (taskIdFromSdk: string) => {
        fi.taskId = taskIdFromSdk
        if (fi.subtaskId) {
          db.subtasks.update(fi.subtaskId, { sdkTaskId: taskIdFromSdk }).catch(() => {})
        }
      },
      onProgress: (info: any) => {
        if (fi.paused) return
        handleUploadProgress(info, fi, ctl)
      },
    })
    handleUploadComplete(null, data, fi, ctl)
    fi.taskRef = data
  } catch (error) {
    console.log('uploadFile error', error)
    // 抛出错误以便上层捕获
    throw error
  } finally {
    console.log(fi)

    // 统计上传完成
    if (fi.finished && !fi.isFolder) {
      ctl.successCount++
    }
  }
}

// 等待上传完成
async function waitForUploadComplete(fi: FileItem): Promise<void> {
  return new Promise<void>(resolve => {
    const start = Date.now()
    const timeout = 10 * 60 * 1000 // 10分钟超时
    const timer = setInterval(() => {
      if (fi.finished || fi.paused) {
        clearInterval(timer)
        fi.uploading = false
        resolve()
      } else if (Date.now() - start > timeout) {
        clearInterval(timer)
        console.warn(`Upload timeout for ${fi.key}`)
        fi.uploading = false
        resolve()
      }
    }, 500)
  })
}

// 处理上传进度
function handleUploadProgress(info: any, fi: FileItem, ctl: TaskController): void {
  const percent = typeof info.percent === 'number' ? Math.min(100, Math.floor(info.percent * 100)) : 0

  if (fi.subtaskId) {
    db.subtasks.update(fi.subtaskId, { progress: percent, status: TaskStatus.EXECUTING }).catch(() => {})
  }

  const totalPerc = Math.floor((ctl.files.reduce((s, f) => s + (f.finished ? 100 : 0), 0) + percent) / ctl.files.length)
  db.tasks.update(ctl.id, { progress: totalPerc }).catch(() => {})
}

// 处理上传完成
async function handleUploadComplete(err: any, data: any, fi: FileItem, ctl: TaskController): Promise<void> {
  // 上传成功处理
  fi.uploading = false
  fi.finished = true
  if (fi.paused) {
    if (fi.subtaskId) {
      await updateSubtaskStatus(fi.subtaskId, TaskStatus.PAUSED)
    }
    return
  }

  if (fi.subtaskId) {
    // 文件夹创建不存在子任务
    await updateSubtaskStatus(fi.subtaskId, TaskStatus.SUCCESS, 100)
  }

  const overall = Math.floor((ctl.successCount / ctl.files.length) * 100)
  await db.tasks.update(ctl.id, { tasking: ctl.successCount, progress: overall }).catch(() => {})

  // 检查是否所有子任务都已完成
  if (ctl.successCount === ctl.files.filter(f => !f.isFolder).length) {
    ctl.status = TaskStatus.SUCCESS
    updateTaskStatus(ctl.id, TaskStatus.SUCCESS)
  }
  triggerUploadCallback(ctl)
}
let lastCallbackTaskId: number | undefined
// 上传任务完成后通知列表的方法
async function uploadCallbackRaw(ctl: any) {
  try {
    const currentUploadedFiles = ctl.files
      .filter((file: FileItem) => file.finished)
      .map((file: FileItem) => ({
        key: file.key,
        size: file.file?.size ?? 0,
      }))
    const newUploadedFiles = currentUploadedFiles.filter(
      current => !ctl.lastUploadedFiles?.some(last => last.key === current.key && last.size === current.size),
    )
    ctl.lastUploadedFiles = currentUploadedFiles
    // await _uploadCallback({
    //   bucketName: ctl.bucketName,
    //   region: ctl.region,
    //   objects: newUploadedFiles,
    // })
    setTimeout(() => {
      events.emit('refreshFileList')
    }, 1000)
  } catch (callbackErr) {
    console.log('Upload callback failed:', callbackErr)
  }
}

const uploadCallback = _debounce(uploadCallbackRaw, 800)

// 触发函数
function triggerUploadCallback(ctl: any) {
  if (lastCallbackTaskId !== ctl.id) {
    lastCallbackTaskId = ctl.id
    uploadCallbackRaw(ctl) // id变化，立即执行
  } else {
    uploadCallback(ctl) // id没变，走防抖
  }
}

// 批量分批处理文件
async function startTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  ctl.status = TaskStatus.EXECUTING
  updateTaskStatus(taskId, TaskStatus.EXECUTING)

  const cred = getCredFromSts(ctl.sts)
  if (!cred || !cred.TmpSecretId || !cred.TmpSecretKey) {
    await updateTaskStatus(taskId, TaskStatus.CANCELLED)
    return
  }

  let cos = cosInstances.get(taskId)
  if (!cos) {
    cos = createCosInstance(cred)
    cosInstances.set(taskId, cos)
  }
  ctl.files.forEach(fi => {
    fi.cos = cos
  })

  // 传递队列实例给 batchProcessFiles
  await batchProcessFiles(ctl.files, async fi => await handleFileUpload(fi, ctl), ctl.queue)

  await checkAndUpdateOverallStatus(taskId)
}

// 暂停任务
async function pauseTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  ctl.status = TaskStatus.PAUSED
  updateTaskStatus(taskId, TaskStatus.PAUSED)
  const cos = cosInstances.get(taskId)

  // 中止队列（停止新的上传任务开始）
  ctl.queue?.setAborted()

  // 只处理未完成且未暂停的文件
  const filesToPause = ctl.files.filter(fi => !fi.finished && !fi.paused)

  try {
    // 5. 使用同步模式批量处理暂停操作
    await batchProcessFiles(
      filesToPause,
      async fi => {
        // 标记文件状态
        fi.paused = true
        fi.uploading = false

        // 尝试调用 COS SDK 的暂停方法
        if (fi.taskId && cos?.pauseTask) {
          cos.pauseTask(fi.taskId)
        }

        // 更新子任务状态到数据库
        if (fi.subtaskId) {
          await updateSubtaskStatus(fi.subtaskId, TaskStatus.PAUSED)
        }
      },
      null, // 不使用队列
      {
        sync: true,
        batchSize: 50, // 可以调整批次大小来优化性能
      },
    )
  } catch (error) {
    console.error(`Error pausing task ${taskId}:`, error)
    // 部分文件可能暂停失败，重新检查状态
    await checkAndUpdateOverallStatus(taskId)
    throw error
  }
}

// 恢复任务
async function resumeTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  ctl.status = TaskStatus.EXECUTING
  updateTaskStatus(taskId, TaskStatus.EXECUTING)

  // 只处理未完成且已暂停的文件
  const filesToResume = ctl.files.filter(fi => !fi.finished && fi.paused)
  if (filesToResume.length === 0) return

  const cos = cosInstances.get(taskId)
  try {
    if (ctl.queue) {
      ctl.queue.reset()
    } else {
      ctl.queue = new AsyncQueue(CONCURRENCY)
    }
    // 先更新状态为执行中
    await batchProcessFiles(
      filesToResume,
      async fi => {
        if (fi.subtaskId) {
          fi.paused = false
          fi.uploading = true
          await updateSubtaskStatus(fi.subtaskId, TaskStatus.EXECUTING)
        }
      },
      null,
      { sync: true, batchSize: 100 },
    )
    // 使用异步队列重新开始上传
    await batchProcessFiles(
      filesToResume,
      async fi => {
        try {
          if (fi.taskId && cos) {
            await handleCosOperation('restart', fi.taskId, cos)
          } else {
            await handleFileUpload(fi, ctl)
          }
        } catch (e) {
          console.error(`Error resuming file ${fi.key}:`, e)
        }
      },
      ctl.queue, // 使用队列控制并发
    )
  } catch (error) {
    console.error(`Error resuming task ${taskId}:`, error)
    await checkAndUpdateOverallStatus(taskId)
    throw error
  }
}

// 取消任务
async function cancelTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) {
    console.log(`Task ${taskId} not found for cancellation`)
    return
  }

  // 立即停止队列中的所有任务
  ctl.queue?.setAborted()

  // 获取 COS 实例
  const cos = cosInstances.get(taskId)

  // 找出所有需要取消的文件
  const filesToCancel = ctl.files.filter(fi => !fi.finished && !fi.paused)

  if (filesToCancel.length === 0) {
    console.log(`No files to cancel for task ${taskId}`)
    // 清理资源
    controllers.delete(taskId)
    cosInstances.delete(taskId)
    return
  }

  try {
    // 使用同步模式批量取消文件
    await batchProcessFiles(
      filesToCancel,
      async fi => {
        // 标记文件状态
        fi.paused = true
        fi.uploading = false

        // 尝试取消 COS 任务
        if (fi.taskId && cos?.cancelTask) {
          console.log(`Cancelling COS task for ${fi.key} with taskId: ${fi.taskId}`)
          cos.cancelTask(fi.taskId)
        }
      },
      null, // 不使用队列
      {
        sync: true,
        batchSize: 50, // 较大的批次大小以快速取消
      },
    )

    // 等待一小段时间确保取消操作完成
    await new Promise(resolve => setTimeout(resolve, 100))

    // 清理资源
    controllers.delete(taskId)
    cosInstances.delete(taskId)
  } catch (error) {
    console.error(`Error cancelling task ${taskId}:`, error)
    // 即使出错也要尝试清理资源
    controllers.delete(taskId)
    cosInstances.delete(taskId)
  }
}

// 重试任务
async function retryTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) {
    console.error(`Task ${taskId} not found for retry`)
    return
  }

  // 更新任务状态
  ctl.status = TaskStatus.EXECUTING
  await updateTaskStatus(taskId, TaskStatus.EXECUTING)

  // 重新创建队列（确保队列是新的）
  ctl.queue = new AsyncQueue(CONCURRENCY)

  // 找出需要重试的文件（未完成的文件）
  const filesToRetry = ctl.files.filter(fi => !fi.finished)

  if (filesToRetry.length === 0) {
    console.log(`No files to retry for task ${taskId}`)
    return
  }

  try {
    // 5. 重置所有需要重试的文件状态
    await batchProcessFiles(
      filesToRetry,
      async fi => {
        // 重置文件状态
        fi.paused = false
        fi.started = false
        fi.uploading = false
        fi.finished = false
        fi.taskRef = undefined
        fi.taskId = undefined

        // 重置子任务状态到 EXECUTING
        if (fi.subtaskId) {
          await updateSubtaskStatus(fi.subtaskId, TaskStatus.EXECUTING, 0)
        }
      },
      null, // 使用同步模式重置状态
      { sync: true, batchSize: 100 },
    )

    // 重新开始上传（使用队列控制并发）
    await batchProcessFiles(
      filesToRetry,
      async fi => {
        try {
          await handleFileUpload(fi, ctl)
        } catch (e) {
          console.error(`Error retrying file ${fi.key}:`, e)
          // 记录失败但继续重试其他文件
          ctl.failCount++
          throw e // 抛出错误以便上层处理
        }
      },
      ctl.queue, // 使用队列控制并发
    )
  } catch (error) {
    console.error(`Error retrying task ${taskId}:`, error)
    // 重试失败，更新状态
    await checkAndUpdateOverallStatus(taskId)
    throw error
  }
}

// 单文件级别控制：暂停某个子文件
// 状态更新工具函数
async function updateTaskAndSubtaskStatus(
  taskId: number,
  subtaskId: number,
  subtaskStatus: TaskStatusType,
  taskStatus?: TaskStatusType,
  progress?: number,
) {
  // 更新子任务状态
  await updateSubtaskStatus(subtaskId, subtaskStatus, progress)

  // 如果指定了任务状态，直接更新
  if (taskStatus !== undefined) {
    await updateTaskStatus(taskId, taskStatus)
    return
  }

  await checkAndUpdateOverallStatus(taskId)
}

// 优化后的文件控制方法
async function pauseFile(taskId: number, subtaskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  const fi = ctl.files.find(f => f.subtaskId === subtaskId)
  if (!fi) return

  // 更新任务状态
  await updateSubtaskStatus(subtaskId, TaskStatus.PAUSED)
  // 更新文件状态
  fi.paused = true
  fi.uploading = false

  try {
    const cos = cosInstances.get(taskId)
    ctl.queue?.pauseTask(subtaskId)

    if (fi.taskId && cos) {
      await handleCosOperation('pause', fi.taskId, cos)
    }
  } catch (e) {
    console.log('pauseFile error', e)
    throw e
  }
}

async function resumeFile(taskId: number, subtaskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  const fi = ctl.files.find(f => f.subtaskId === subtaskId)
  if (!fi) return

  // 更新任务状态
  await updateSubtaskStatus(subtaskId, TaskStatus.EXECUTING)

  try {
    const cos = cosInstances.get(taskId)
    ctl.queue?.resumeTask(subtaskId)
    if (fi.taskId && cos) {
      await handleCosOperation('restart', fi.taskId, cos)
      fi.paused = false
      fi.uploading = true
    } else {
      // 重置状态并重新开始
      fi.started = false
      fi.paused = false
      fi.taskRef = undefined
      await handleFileUpload(fi, ctl)
    }
  } catch (e) {
    console.log('resumeFile error', e)
    throw e
  }
}

async function cancelFile(taskId: number, subtaskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  const fi = ctl?.files.find(f => f.subtaskId === subtaskId)
  if (!fi) return

  try {
    // 更新文件状态
    fi.paused = true
    fi.uploading = false

    const cos = cosInstances.get(taskId)
    ctl.queue?.cancelTask(subtaskId)

    if (fi.taskId && cos) {
      await handleCosOperation('cancel', fi.taskId, cos)
    } else {
      fi.taskRef?.abort?.()
      fi.taskRef?.cancel?.()
    }
    // 从数组中移除该文件
    const index = ctl.files.indexOf(fi)
    if (index > -1) {
      ctl.files.splice(index, 1)
    }

    // 更新子任务状态
    // await updateSubtaskStatus(subtaskId, TaskStatus.CANCELLED)
  } catch (e) {
    console.log('cancelFile error', e)
    throw e
  }
}

async function retryFile(taskId: number, subtaskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  const fi = ctl.files.find(f => f.subtaskId === subtaskId)
  if (!fi || fi.finished) return

  try {
    // 重置文件状态
    fi.paused = false
    fi.started = false
    fi.taskRef = undefined
    fi.uploading = false
    // 尝试恢复上传
    await handleFileUpload(fi, ctl)
  } catch (e) {
    console.log('retryFile error', e)
  }
}

async function clearTaskList() {
  console.log('任务列表已清空')

  // 清空 COS 实例
  cosInstances.clear()

  // 清空数据库中的任务和子任务记录
  await db.tasks.clear()
  await db.subtasks.clear()
}

// 监听页面刷新或关闭
window.addEventListener('beforeunload', clearTaskList)

export {
  createAndStartTask,
  startTask,
  pauseTask,
  resumeTask,
  cancelTask,
  retryTask,
  pauseFile,
  resumeFile,
  cancelFile,
  retryFile,
  checkAndUpdateOverallStatus,
}
