import COS from 'cos-js-sdk-v5'
import { db } from './upload-db'
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
  bucket: string
  region: string
  headers?: any
  status: TaskStatusType // 1 executing,2 paused,3 cancelled/failed,4 success
  successCount: number
  failCount: number
  lastUploadedFiles: { key: string; size: number }[]
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

// 状态管理工具函数
const updateTaskStatus = async (taskId: number, status: TaskStatusType) => {
  await db.tasks.update(taskId, { status }).catch(() => {})
}

const updateSubtaskStatus = async (subtaskId: number, status: TaskStatusType, progress?: number) => {
  const updateData: any = { status }
  if (progress !== undefined) {
    updateData.progress = progress
  }
  await db.subtasks.update(subtaskId, updateData).catch(() => {})
}

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

const handleCosTask = async (taskType: 'pause' | 'cancel' | 'restart', taskId: string, cos: any) => {
  const methodName = `${taskType}Task`
  if (taskId && cos && typeof cos[methodName] === 'function') {
    try {
      await cos[methodName](taskId)
    } catch (e) {
      console.log(`${methodName} error`, e)
      throw e
    }
  }
}

// 错误处理工具函数
const handleUploadError = async (error: any, taskId: number, subtaskId: number) => {
  console.log(`upload error for taskId ${taskId}`, error)
  if (error?.message?.startsWith('CORS blocked or network error')) {
    notify.error(t('oss.s7.checkNetworkOrCrossDomainSettings'))
  }
  await updateSubtaskStatus(subtaskId, TaskStatus.CANCELLED)
  if (error.Code !== 'UserCancelled') {
    const ctl = controllers.get(taskId)
    if (ctl) {
      ctl.failCount++
      await db.tasks.update(taskId, { tasking: ctl.successCount }).catch(() => {})
    }
  }
}

// 数据库操作工具函数
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

const checkAndUpdateOverallStatus = async (taskId: number) => {
  const subtasks = await db.subtasks.where('taskId').equals(taskId).toArray()
  const ctl = controllers.get(taskId)
  if (!ctl) return

  if (subtasks.some(sub => sub.status === TaskStatus.CANCELLED)) {
    ctl.status = TaskStatus.CANCELLED
  } else if (subtasks.some(sub => sub.status === TaskStatus.PAUSED)) {
    ctl.status = TaskStatus.PAUSED
  } else if (subtasks.every(sub => sub.status === TaskStatus.SUCCESS)) {
    ctl.status = TaskStatus.SUCCESS
  }

  await updateTaskStatus(taskId, ctl.status)
}

// 新增：递归收集所有文件夹和文件，文件夹优先
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

const cosInstances = new Map<number, any>()

// 主要功能函数
async function createAndStartTask(
  taskId: number,
  filesRaw: any[],
  sts: any,
  // bucket: string,
  // region: string,
  headers?: any,
  prefix: string = '',
) {
  if (!taskId) return

  // 递归展开所有文件夹和文件，文件夹优先
  const files: FileItem[] = flattenFilesAndFolders(filesRaw, '', prefix)
  console.log(files, 'files', filesRaw)

  const controller: TaskController = {
    id: taskId,
    files,
    sts,
    bucket: sts.bucketName,
    region: sts.region,
    headers: headers || {},
    status: TaskStatus.EXECUTING,
    successCount: 0,
    failCount: 0,
    lastUploadedFiles: [],
  }
  controllers.set(taskId, controller)

  await initializeSubtasks(taskId, files)
  // 新增：更新任务总数
  await db.tasks.update(taskId, { taskNumber: files.filter(fi => !fi.isFolder).length }).catch(() => {})
  await updateTaskStatus(taskId, TaskStatus.EXECUTING)
  await startTask(taskId)
}

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

async function startTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  // 更新任务状态
  ctl.status = TaskStatus.EXECUTING
  await updateTaskStatus(taskId, TaskStatus.EXECUTING)

  // 验证凭证
  const cred = getCredFromSts(ctl.sts)
  if (!cred || !cred.TmpSecretId || !cred.TmpSecretKey) {
    console.log('Invalid STS when starting task', taskId)
    await updateTaskStatus(taskId, TaskStatus.CANCELLED)
    return
  }

  // 获取或创建 COS 实例
  let cos = cosInstances.get(taskId)
  if (!cos) {
    cos = createCosInstance(cred)
    cosInstances.set(taskId, cos)
  }

  // 为所有文件设置 COS 实例
  ctl.files.forEach(fi => {
    fi.cos = cos
  })

  // 处理文件上传
  const filePromises = ctl.files.map(async fi => await handleFileUpload(fi, ctl))
  try {
    await Promise.all(filePromises)
  } catch (error) {
    console.log('Error during file uploads:', error)
  }
  // for (const fi of ctl.files) {
  //   try {
  //     await handleFileUpload(fi, ctl)
  //   } catch (e) {
  //     await cancelAllInFlight(ctl)
  //     ctl.status = TaskStatus.CANCELLED
  //     await updateTaskStatus(ctl.id, TaskStatus.CANCELLED)
  //     throw e
  //   }
  // }
  // 更新最终状态
  await checkAndUpdateOverallStatus(taskId)
}

// 处理单个文件的上传
async function handleFileUpload(fi: FileItem, ctl: TaskController): Promise<void> {
  if (fi.finished) return

  try {
    // if (fi.isFolder) {
    //   // 文件夹子任务：直接 putObject 创建空文件夹
    //   await handleFolderCreate(fi, ctl)
    // } else
    if (fi.started && fi.paused && fi.taskId) {
      await handlePausedFile(fi, ctl)
    } else if (fi.started && fi.uploading) {
      await handleUploadingFile(fi)
    } else if (!fi.started) {
      await handleNewFile(fi, ctl)
    }
  } catch (error) {
    console.log(`Error handling file ${fi.key}:`, error)
    await handleUploadError(error, ctl.id, fi.subtaskId!)
    throw error
  }
}

// 处理已暂停的文件
async function handlePausedFile(fi: FileItem, ctl: TaskController): Promise<void> {
  if (!fi.cos) return

  try {
    await handleCosTask('restart', fi.taskId!, fi.cos)
    fi.paused = false
    fi.uploading = true
    await updateSubtaskStatus(fi.subtaskId!, TaskStatus.EXECUTING)
    await waitForUploadComplete(fi)
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

  const taskRef = fi.cos.uploadFile(
    {
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
    },
    (err: any, data: any) => {
      handleUploadComplete(err, data, fi, ctl)
    },
  )

  fi.taskRef = taskRef
}

// 处理文件夹创建
// async function handleFolderCreate(fi: FileItem, ctl: TaskController): Promise<void> {
//   if (fi.finished) return
//   fi.started = true
//   fi.uploading = true
//   const cos = fi.cos
//   try {
//     await new Promise((resolve, reject) => {
//       cos.putObject(
//         {
//           Bucket: ctl.bucket,
//           Region: ctl.region,
//           Key: fi.key,
//           Body: '',
//         },
//         (err: any, data: any) => {
//           if (err) reject(err)
//           else resolve(data)
//         },
//       )
//     })
//     fi.finished = true
//     fi.uploading = false
//   } catch (err) {
//     fi.uploading = false
//     throw err
//   }
// }

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
  fi.uploading = false

  if (fi.paused) {
    if (fi.subtaskId) {
      await updateSubtaskStatus(fi.subtaskId, TaskStatus.PAUSED)
    }
    return
  }

  if (err) {
    if (err?.message?.startsWith('CORS blocked or network error')) {
      notify.error(t('oss.s7.checkNetworkOrCrossDomainSettings'))
      // 特殊处理网络错误，把所有子任务全部标记为失败，取消上传
      ctl.status = TaskStatus.CANCELLED
      await updateTaskStatus(ctl.id, TaskStatus.CANCELLED)
      await Promise.all(ctl.files.map(f => f.subtaskId && updateSubtaskStatus(f.subtaskId, TaskStatus.CANCELLED)))
      return
    }
    console.log(err)
    if (fi.subtaskId) {
      // 如果err.message = The specified multipart upload does not exist.The upload ID might be invalid, or the multipart upload might have been aborted or completed. 需要对这个文件进行重新上传
      if (err?.message?.includes('The specified multipart upload does not exist')) {
        await handleNewFile(fi, ctl)
        return
      }
      await updateSubtaskStatus(fi.subtaskId, TaskStatus.CANCELLED)
    }
    ctl.failCount++
    await db.tasks.update(ctl.id, { tasking: ctl.successCount, status: TaskStatus.CANCELLED }).catch(() => {})
    return
  }

  // 上传成功处理
  fi.finished = true
  if (fi.subtaskId) {
    // 文件夹创建不存在子任务
    ctl.successCount++
    await updateSubtaskStatus(fi.subtaskId, TaskStatus.SUCCESS, 100)
  }

  const overall = Math.floor((ctl.successCount / ctl.files.length) * 100)
  await db.tasks.update(ctl.id, { tasking: ctl.successCount, progress: overall }).catch(() => {})

  // 检查是否所有子任务都已完成
  if (ctl.successCount === ctl.files.filter(f => !f.isFolder).length) {
    ctl.status = TaskStatus.SUCCESS
    await updateTaskStatus(ctl.id, TaskStatus.SUCCESS)
  }
  uploadCallback(ctl)
}

// 上传任务完成后通知列表的方法
const uploadCallback = _debounce(async (ctl: any) => {
  try {
    // 获取本次上传成功的文件列表
    const currentUploadedFiles = ctl.files
      .filter((file: FileItem) => file.finished)
      .map((file: FileItem) => ({
        key: file.key,
        size: file.file?.size ?? 0,
      }))

    // 获取新增的上传文件（去除上次已上传的）
    const newUploadedFiles = currentUploadedFiles.filter(
      current => !ctl.lastUploadedFiles?.some(last => last.key === current.key && last.size === current.size),
    )

    // 更新上次上传文件列表
    ctl.lastUploadedFiles = currentUploadedFiles

    // await _uploadCallback({
    //   bucketName: ctl.bucket,
    //   region: ctl.region,
    //   objects: newUploadedFiles,
    // })

    setTimeout(() => {
      events.emit('refreshFileList')
    }, 1000)
  } catch (callbackErr) {
    console.log('Upload callback failed:', callbackErr)
  }
}, 800)

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

async function pauseTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  ctl.status = TaskStatus.PAUSED
  const cos = cosInstances.get(taskId)
  // 使用 Promise.all 并行处理所有文件
  await Promise.all(
    ctl.files.map(async fi => {
      // 统一状态更新
      fi.paused = true
      fi.uploading = false

      // 统一错误处理
      const handleError = (e: any) => {
        console.log('pauseTask error', e)
        throw e
      }
      try {
        if (fi.taskId && cos?.pauseTask) {
          await cos.pauseTask(fi.taskId)
        } else {
          // fi.taskRef?.abort?.()
          // fi.taskRef?.cancel?.()
        }
      } catch (e) {
        handleError(e)
      }

      // 更新子任务状态
      if (fi.subtaskId) {
        const subtask = await db.subtasks.get(fi.subtaskId)
        if (subtask?.status === TaskStatus.EXECUTING) {
          updateSubtaskStatus(fi.subtaskId, TaskStatus.PAUSED)
        }
      }
    }),
  )

  await updateTaskStatus(taskId, TaskStatus.PAUSED)
}

async function cancelTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  ctl.status = TaskStatus.CANCELLED
  const cos = cosInstances.get(taskId)

  // 使用 Promise.all 并行处理所有文件
  await Promise.all(
    ctl.files.map(async fi => {
      // 统一状态更新
      fi.paused = true
      fi.uploading = false

      // 统一错误处理
      const handleError = (e: any) => {
        console.log('cancelTask error', e)
        throw e
      }

      try {
        if (fi.taskId && cos?.cancelTask) {
          await cos.cancelTask(fi.taskId)
        } else {
          fi.taskRef?.abort?.()
          fi.taskRef?.cancel?.()
        }
      } catch (e) {
        handleError(e)
      }

      // 更新子任务状态
      if (fi.subtaskId) {
        await updateSubtaskStatus(fi.subtaskId, TaskStatus.CANCELLED)
      }
    }),
  )

  // 使用 Promise 替代 setTimeout
  await new Promise(resolve => setTimeout(resolve, 1000))

  controllers.delete(taskId)
  cosInstances.delete(taskId)
  await updateTaskStatus(taskId, TaskStatus.CANCELLED)
}

async function retryTask(taskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  const cos = cosInstances.get(taskId)

  // 使用 Promise.all 并行处理所有文件
  await Promise.all(
    ctl.files.map(async fi => {
      if (fi.finished) return

      // 统一状态更新
      fi.paused = false

      // 统一错误处理
      const handleError = (e: any) => {
        console.log('retryTask error', e)
        throw e
      }

      try {
        if (fi.taskId && cos?.restartTask) {
          await cos.restartTask(fi.taskId)
          fi.uploading = true
        } else {
          fi.started = false
          fi.taskRef = undefined
          if (fi.subtaskId) {
            await updateSubtaskStatus(fi.subtaskId, TaskStatus.EXECUTING, 0)
          }
        }
      } catch (e) {
        handleError(e)
      }
    }),
  )

  // 更新控制器状态
  ctl.status = TaskStatus.EXECUTING
  ctl.failCount = 0
  ctl.successCount = ctl.files.filter(f => f.finished).length

  await updateTaskStatus(taskId, TaskStatus.EXECUTING)
  await startTask(taskId)
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

  // 否则根据子任务状态自动判断
  const subtasks = await db.subtasks.where('taskId').equals(taskId).toArray()
  const ctl = controllers.get(taskId)
  if (!ctl) return

  if (subtasks.some(sub => sub.status === TaskStatus.EXECUTING)) {
    ctl.status = TaskStatus.EXECUTING
  } else if (subtasks.some(sub => sub.status === TaskStatus.PAUSED)) {
    ctl.status = TaskStatus.PAUSED
  } else if (subtasks.every(sub => sub.status === TaskStatus.SUCCESS)) {
    ctl.status = TaskStatus.SUCCESS
  }

  await updateTaskStatus(taskId, ctl.status)
}

// COS 操作工具函数
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

// 优化后的文件控制方法
async function pauseFile(taskId: number, subtaskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  const fi = ctl.files.find(f => f.subtaskId === subtaskId)
  if (!fi) return

  // 更新文件状态
  fi.paused = true
  fi.uploading = false

  try {
    const cos = cosInstances.get(taskId)
    if (fi.taskId && cos) {
      await handleCosOperation('pause', fi.taskId, cos)
    } else {
      fi.taskRef?.abort?.()
      fi.taskRef?.cancel?.()
    }

    // 更新状态
    await updateTaskAndSubtaskStatus(taskId, subtaskId, TaskStatus.PAUSED)
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

  try {
    const cos = cosInstances.get(taskId)
    if (fi.taskId && cos) {
      await handleCosOperation('restart', fi.taskId, cos)
      fi.paused = false
      fi.uploading = true
      await updateTaskAndSubtaskStatus(taskId, subtaskId, TaskStatus.EXECUTING)
    } else {
      // 重置状态并重新开始
      fi.started = false
      fi.paused = false
      fi.taskRef = undefined
      await updateTaskAndSubtaskStatus(taskId, subtaskId, TaskStatus.EXECUTING, undefined, 0)
      await startTask(taskId)
    }
  } catch (e) {
    console.log('resumeFile error', e)
    throw e
  }
}

async function cancelFile(taskId: number, subtaskId: number) {
  const ctl = controllers.get(taskId)
  if (!ctl) return

  try {
    const fi = ctl?.files.find(f => f.subtaskId === subtaskId)
    if (fi) {
      // 更新文件状态
      fi.paused = true
      fi.uploading = false

      const cos = cosInstances.get(taskId)
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
    }

    // 更新子任务状态
    await updateSubtaskStatus(subtaskId, TaskStatus.CANCELLED)
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

    // 重置子任务状态
    await updateTaskAndSubtaskStatus(taskId, subtaskId, TaskStatus.EXECUTING, undefined, 0)

    // 尝试恢复上传
    const cos = cosInstances.get(taskId)
    if (fi.taskId && cos) {
      await handleCosOperation('restart', fi.taskId, cos)
      fi.uploading = true
    } else {
      await startTask(taskId)
    }
  } catch (e) {
    console.log('retryFile error', e)
    throw e
  }
}

function clearTaskList() {
  console.log('任务列表已清空')

  // 清空 COS 实例
  cosInstances.clear()

  // 清空数据库中的任务和子任务记录
  db.tasks.clear().catch(err => {
    console.log('清空任务记录失败:', err)
  })
  db.subtasks.clear().catch(err => {
    console.log('清空子任务记录失败:', err)
  })
}

// 监听页面刷新或关闭
window.addEventListener('beforeunload', clearTaskList)

export { createAndStartTask, startTask, pauseTask, cancelTask, retryTask, pauseFile, resumeFile, cancelFile, retryFile }
