import Dexie from 'dexie'

export const db = new Dexie('UploadTasksDB') as Dexie & {
  tasks: Dexie.Table<any, number>
  subtasks: Dexie.Table<any, number>
}

db.version(1).stores({
  tasks: '++id, taskName, status, progress, tasking, taskNumber',
  subtasks: '++id, taskId, key, size, progress, status',
})

// 版本升级：添加 sdkTaskId 索引并清空旧数据
// db.version(2)
//   .stores({
//     tasks: '++id, taskName, status, progress, tasking, taskNumber',
//     subtasks: '++id, taskId, sdkTaskId, key, size, progress, status',
//   })
//   .upgrade(tx => {
//     // 清空旧数据
//     return tx.subtasks.clear()
//   })
