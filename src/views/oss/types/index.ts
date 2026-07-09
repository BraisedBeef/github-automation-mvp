// types/task.ts
export enum TaskStatus {
  /**执行中 */
  EXECUTING = 1,
  /**已暂停 */
  PAUSED = 2,
  /**执行失败 */
  CANCELLED = 3,
  /**已完成 */
  SUCCESS = 4,
}

export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskType {
  /**上传 */
  UPLOAD = 'upload',
  /**清空桶 */
  CLEAR_BUCKET = 'clear_bucket',
  /**批量删除 */
  BATCH_DELETE = 'batch_delete_objects',
  /**批量修改加密 */
  BATCH_UPDATE_ENCRYPTION = 'batch_update_encryption',
  /**批量修改访问权限 */
  BATCH_UPDATE_ACL = 'batch_update_acl',
  /**复制文件 */
  COPY_OBJECT = 'copy_object',
}

export enum TaskTypeRes {
  /**清空桶 */
  CLEAR_BUCKET_RES = 'clear_bucket_resp',
  /**批量删除 */
  BATCH_DELETE_RES = 'batch_delete_objects_resp',
  /**批量修改加密 */
  BATCH_UPDATE_ENCRYPTION_RES = 'batch_update_encryption_resp',
  /**批量修改访问权限 */
  BATCH_UPDATE_ACL_RES = 'batch_update_acl_resp',
  /**复制文件 */
  COPY_OBJECT_RES = 'copy_object_resp',
}

export type ActionType = Exclude<TaskType, TaskType.UPLOAD>

export interface Task {
  subtaskId: number // 任务ID
  name: string // 任务名称
  status: TaskStatus // 任务状态
  progress: number // 进度 0-100
}

export interface TaskCommand {
  type: string
  action: 'del_success' | 'del_failed' | 'cancel'
  taskId: string
  data?: any
}

export interface TaskMessage {
  type: 'clear_bucket_resp'
  status: 'progress' | 'complete'
  taskId: string
  data: {
    total_status: {
      total: number
      success: number
      failed: number
      progress: number
    }
    details: {
      key: string
      status: string
      size: number
      subtaskId: number
      index?: number
    }[]
  }
}

export interface ParamsType {
  [k: string]: any
}

export interface TaskInfo {
  type: ActionType
  taskId: string
  taskNumber?: number
  isAddTask?: boolean
  subtasks?: Task[]
}
