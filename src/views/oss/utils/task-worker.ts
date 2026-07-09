import { liveQuery } from 'dexie'
import { db } from './upload-db'

let tasksSub: any = null
let subtasksSub: any = null
// 处理主任务列表
self.onmessage = async e => {
  const { type, payload } = e.data
  console.log(type, payload, 'worker收到消息')

  try {
    switch (type) {
      case 'LOAD_TASKS': {
        const tasks = await db.tasks.toArray()
        self.postMessage({ type: 'TASKS_LOADED', payload: tasks })
        break
      }

      case 'LOAD_SUBTASKS': {
        const subtasks = await db.subtasks.where('taskId').equals(payload.taskId).sortBy('index')
        self.postMessage({
          type: 'SUBTASKS_LOADED',
          payload: {
            taskId: payload.taskId,
            subtasks: subtasks,
          },
        })
        break
      }

      case 'FILTER_SUBTASKS': {
        const { subtasks, active } = payload
        const filtered = subtasks.filter(row => {
          if (active === 1) return row.status === 1 || row.status === 2
          if (active === 2) return row.status === 4
          if (active === 3) return row.status === 3
          return true
        })
        self.postMessage({ type: 'SUBTASKS_FILTERED', payload: filtered })
        break
      }

      case 'SUBSCRIBE_TASKS': {
        tasksSub = liveQuery(() => db.tasks.toArray()).subscribe({
          next: tasks => {
            // console.log('主任务更新了', tasks)
            self.postMessage({ type: 'TASKS_UPDATED', payload: tasks })
          },
          error: err => {
            self.postMessage({ type: 'ERROR', payload: err })
          },
        })
        break
      }

      case 'SUBSCRIBE_SUBTASKS': {
        const { taskId } = payload

        // 取消旧订阅
        if (subtasksSub && typeof subtasksSub.unsubscribe === 'function') {
          subtasksSub.unsubscribe()
        }

        // 如果有新的 taskId，建立新订阅
        if (taskId) {
          subtasksSub = liveQuery(() => db.subtasks.where('taskId').equals(taskId).toArray()).subscribe({
            next: (subtasks: any[]) => {
              console.log(taskId, '子任务更新了')

              self.postMessage({
                type: 'SUBTASKS_UPDATED',
                payload: {
                  taskId,
                  subtasks: subtasks.sort((a, b) => (a.index || 0) - (b.index || 0)),
                },
              })
            },
            error: err => {
              self.postMessage({ type: 'ERROR', payload: err })
            },
          })
        } else {
          self.postMessage({
            type: 'SUBTASKS_UPDATED',
            payload: { taskId, subtasks: [] },
          })
        }
        break
      }

      case 'CLEAR_SUBTASK': {
        const { taskId, subtaskId } = payload

        try {
          // 删除指定的子任务
          await db.subtasks
            .where('taskId')
            .equals(taskId)
            .and(subtask => subtask.id === subtaskId)
            .delete()

          // 检查剩余子任务
          const remainingSubtasks = await db.subtasks.where('taskId').equals(taskId).toArray()

          if (remainingSubtasks.length === 0) {
            // 删除主任务
            await db.tasks.delete(taskId)
            self.postMessage({
              type: 'SUBTASK_CLEARED',
              payload: { taskId, shouldReturnToTaskList: true },
            })
          } else {
            // 更新主任务状态
            const task = await db.tasks.get(taskId)
            console.log(task)
            /**
             * 还有子任务在执行或暂停，则更新 tasking 和 status 为执行中
             * 如果全部为失败
             *
             */
            if (task) {
              const hasExecutingOrPaused = remainingSubtasks.some(t => t.status === 1 || t.status === 2)
              const activeSubtasksCount = hasExecutingOrPaused
                ? remainingSubtasks.filter(t => t.status === 3 || t.status === 4).length
                : task.taskNumber - 1
              await db.tasks.update(taskId, {
                tasking: activeSubtasksCount,
                taskNumber: task.taskNumber - 1,
                status: hasExecutingOrPaused ? 1 : 4,
              })
            }
          }
        } catch (error) {
          self.postMessage({ type: 'ERROR', payload: error })
        }
        break
      }

      case 'UNSUBSCRIBE': {
        if (tasksSub && typeof tasksSub.unsubscribe === 'function') tasksSub.unsubscribe()
        if (subtasksSub && typeof subtasksSub.unsubscribe === 'function') subtasksSub.unsubscribe()
        break
      }
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: error })
  }
}
