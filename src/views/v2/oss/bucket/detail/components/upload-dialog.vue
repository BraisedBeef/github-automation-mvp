<template>
  <CatDialog
    v-if="show"
    v-model:dialog="dialogVisible"
    :loading="loading"
    width="812"
    :title="$t('oss.fileList.uploadFile')"
    :close-on-click-modal="false"
    @update:dialog="cancel"
    @open="open"
  >
    <p class="title_desc">
      <span class="label">{{ $t('oss.fileList.uploadTo') }}</span>
      <span>{{ title }}</span>
    </p>

    <div class="df mt20 mb20" style="gap: 8px">
      <el-button type="primary" @click="uploadFn('file')">
        {{ t('oss.fileList.selectFile') }}
      </el-button>
      <el-button @click="uploadFn('dir')">
        {{ t('oss.fileList.selectFolder') }}
      </el-button>
    </div>
    <Tip
      :text="[
        {
          main: t('oss.fileList.uploadTip'),
          sub: [t('oss.fileList.uploadTip1')],
        },
      ]"
      type="OneToMany"
    />

    <el-upload
      ref="uploadRef"
      class="upload-demo"
      drag
      action="#"
      multiple
      :show-file-list="false"
      :file-list="fileList"
      :auto-upload="false"
      :on-change="handleChange"
      :before-upload="beforeUpload"
    >
      <div
        class="upload-wrap"
        style="padding: 20px 10px"
        @click.stop="handleAreaClick"
        @dragover.prevent
        @drop.prevent="handlePictureBoxDrop"
      >
        <SvgIcon name="storage-upload-ing" style="font-size: 48px" />
        <div class="mt10" style="color: #999">
          {{ t('oss.fileList.uploadTip2') }}
        </div>
      </div>
    </el-upload>

    <!-- <el-table ref="fileTableRef" v-show="fileList.length" :data="fileList" :max-height="tableHeight || 300">
      <el-table-column min-width="180" :label="t('oss.fileList.fileFolder')" prop="name">
        <template #default="{ row }">
          <div class="folder-item">
            <div v-if="!row.isFolder" class="flex1">{{ row.name }}</div>
            <div v-else>
              <SvgIcon name="storage-folder" class="mr5" />
              <span>{{ row.name }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="80" :label="t('oss.fileList.size')" :formatter="row => formatFileSize(row.size)">
      </el-table-column>
      <el-table-column min-width="120" :label="t('oss.fileList.status')">
        <template #default="{ row }">
          <span v-if="row.status === 'success'" style="color: #0fbe5b">{{ t('oss.fileList.added') }}</span>
          <span v-else style="color: #fe4d4f">{{ t('oss.fileList.fileSizeExceedsLimitNotAdded') }}</span>
        </template>
      </el-table-column>
      <el-table-column width="120" :label="t('oss.operation')">
        <template #default="{ row }">
          <DisableText
            v-if="row.status === 'success'"
            :disabled="false"
            :text="t('oss.fileList.remove')"
            @click="delFileList(row)"
          />
          <p v-else>-</p>
        </template>
      </el-table-column>
    </el-table> -->
    <el-auto-resizer
      v-show="fileList.length"
      ref="fileTableRef"
      :style="`height: ${computeTableHeight + 95}px; margin-top: 16px;`"
    >
      <template #default="{ width, height }">
        <el-table-v2 :width="width" :height="height" :columns="columns" :data="fileList" fixed />
      </template>
    </el-auto-resizer>
    <p v-show="fileList.length > 0" class="file-info">
      <span>{{ t('oss.fileList.fileCount', [fileList.length]) }}</span>
      <span>{{ t('oss.fileList.totalSize', [totalSize]) }}</span>
    </p>

    <el-collapse v-model="activeNames">
      <el-collapse-item name="1">
        <template #title>
          <div class="collapse-title">
            <span>{{ t('oss.fileList.advancedSettings') }}</span>
            <el-icon v-if="!activeNames.includes('1')">
              <CaretRight />
            </el-icon>
            <el-icon v-else>
              <CaretBottom />
            </el-icon>
          </div>
        </template>
        <div class="form">
          <div class="form-item">
            <p class="label" style="width: 100px">
              {{ t('oss.fileList.fileAccessPermission') }}
            </p>
            <div>
              <el-radio-group v-model="updata['x-oss-acl']">
                <el-radio :label="'default'">
                  {{ t('oss.fileList.inheritedPermission') }}
                </el-radio>
                <el-radio :label="'private'">
                  {{ t('oss.privateReadWrite') }}
                </el-radio>
                <el-radio :label="'public-read'">
                  {{ t('oss.publicReadPrivateWrite') }}
                </el-radio>
              </el-radio-group>
              <p v-if="updata['x-oss-acl'] === 'default'" class="desc">
                {{ t('oss.fileList.inheritedPermissionTip') }}
              </p>
              <p v-else-if="updata['x-oss-acl'] === 'private'" class="desc">
                <i18n-t keypath="oss.fileList.accessDesc">
                  <span style="color: #000"> {{ t('oss.fileList.setAccessPermission') }} </span>
                </i18n-t>
              </p>
              <p v-else class="desc df">
                <el-tag type="danger" class="mr10">
                  {{ t('oss.highRisk') }} </el-tag
                >{{ t('oss.fileList.noAuthReadWarning') }}
              </p>
            </div>
          </div>
          <div class="form-item">
            <p class="label" style="width: 100px">
              {{ t('oss.serverEncryption') }}
            </p>
            <div>
              <el-radio-group v-model="updata['x-oss-server-side-encryption']">
                <el-radio :label="'default'" :disabled="currSelectBucket?.sseAlgorithm === 'AES256'">
                  {{ t('oss.noEncryption') }}
                </el-radio>
                <el-radio :label="'AES256'">
                  <div class="df ac">
                    {{ t('oss.sseCosEncryption') }}
                    <ElTooltip :content="t('oss.sseCosEncryptionTip')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" class="ml10" />
                    </ElTooltip>
                  </div>
                </el-radio>
              </el-radio-group>
              <p v-if="currSelectBucket?.sseAlgorithm === 'AES256'">
                {{ t('oss.s6.sseOssEncrypted') }}
              </p>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <template #footer>
      <div class="cat-dialog-footer">
        <el-button :disabled="!fileList.length" type="primary" class="mb20" @click="submit">
          {{ t('oss.fileList.upload') }}
        </el-button>
        <el-button class="mb20" @click="cancel">
          {{ t('oss.cancel') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>

<script lang="ts" setup>
import { _getUploadStsToken } from '@/apis/oss/storage-list'
import t from '@/utils/i18n'
import { formatFileSize } from '@/views/oss/utils/upload'
import { createAndStartTask } from '@/views/oss/utils/upload-task-manager'
import { CaretRight, CaretBottom } from '@element-plus/icons-vue'
import { db } from '@/views/oss/utils/upload-db'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { useOssStore } from '@/store'
import { ElTooltip } from 'element-plus'
import { BucketInfo } from '@/views/oss/hooks/use-oss'
import UploadWorker from '@/views/oss/utils/upload-worker.ts?worker'
import { notify } from '@/utils/notification'
import { getDateDayjs, maoYunDayJs } from '@/utils/mao-yun-day-js'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['update:show', 'success'])
const route = useRoute()

const columns = [
  {
    key: 'name',
    title: t('oss.fileList.fileFolder'),
    width: 220,
    class: 'columns_name',
    headerClass: 'columns_name',
    cellRenderer: (({ rowData }) => {
      return h(
        ElTooltip,
        {
          content: rowData.name,
          placement: 'top',
          disabled: false,
          effect: 'light',
        },
        {
          default: () =>
            h('div', { class: 'folder-item' }, [
              !rowData.isFolder
                ? h('div', { class: 'flex1' }, rowData.name)
                : h('div', [h(SvgIcon, { name: 'storage-folder', class: 'mr5' }), h('span', rowData.name)]),
            ]),
        },
      )
    }) as any,
  },
  {
    key: 'size',
    title: t('oss.fileList.size'),
    width: 120,
    class: 'columns_size',
    headerClass: 'columns_size',
    cellRenderer: ({ rowData }) => formatFileSize(rowData.size),
  },
  {
    key: 'status',
    title: t('oss.fileList.status'),
    width: 140,
    class: 'columns_status',
    headerClass: 'columns_status',
    cellRenderer: ({ rowData }) => {
      if (rowData.status === 'success') {
        return h('span', { style: 'color: #0fbe5b' }, t('oss.fileList.added'))
      } else {
        return h('div', { class: 'ellipsis-tooltip' }, [
          h(
            ElTooltip,
            {
              content: t('oss.fileList.fileSizeExceedsLimitNotAdded'),
              placement: 'top',
              effect: 'light',
            },
            {
              default: () =>
                h(
                  'span',
                  {
                    style: {
                      color: '#fe4d4f',
                      display: 'inline-block',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  },
                  t('oss.fileList.fileSizeExceedsLimitNotAdded'),
                ),
            },
          ),
        ])
      }
    },
  },
  {
    key: 'operation',
    title: t('oss.operation'),
    width: 120,
    class: 'columns_operation',
    headerClass: 'columns_operation',
    cellRenderer: ({ rowData }) => {
      return h(
        'span',
        {
          style: { cursor: 'pointer', color: '#0063ff' },
          onClick: () => delFileList(rowData),
        },
        t('oss.fileList.remove'),
      )
    },
  },
]

const fileTableRef = ref()

const tableHeightBox = ref(0)
const maxTableHeight = ref(0)

const computeTableHeight = computed(() => {
  return Math.min(tableHeightBox.value, maxTableHeight.value)
})

// 当前桶信息
const currSelectBucket = inject<BucketInfo>('currSelectBucket', {
  name: '',
  region: '',
  sseAlgorithm: '',
})

const uploadRef = ref()
const loading = ref<boolean>(false)
const fileList = ref<any[]>([])
const activeNames = ref<string[]>([])
const updata = ref({
  'x-oss-acl': 'default',
  'x-oss-server-side-encryption': 'default',
})

const ossStore = useOssStore()

const worker = new UploadWorker()
const workerCallbacks = new Map<string, (data: any) => void>()
// 原始文件映射: uid -> File
const rawFileMap = shallowRef(new Map<string, File>())

worker.onmessage = (e: MessageEvent) => {
  const { type, id, payload } = e.data
  const resolve = workerCallbacks.get(id)
  console.log(type, 'typetypetype', resolve)
  if (resolve) {
    resolve(payload)
    workerCallbacks.delete(id)
  }
}

const callWorker = (type: string, payload: any) => {
  return new Promise<any>(resolve => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    console.log(type, 'type', id, 'id')
    workerCallbacks.set(id, resolve)
    worker.postMessage({ type, payload, id })
  })
}

const title = computed(() => {
  return String(route.params.name) + (ossStore.folders.length > 0 ? ' / ' + ossStore.folders.join('/') : '')
})

const dialogVisible = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

// 文件总大小
const totalSize = computed(() => {
  return formatFileSize(fileList.value.reduce((pre, cur) => pre + cur.size, 0))
})

const uploadFn = (type: 'file' | 'dir') => {
  const input = uploadRef.value?.$el.querySelector('.el-upload__input') as HTMLInputElement
  if (input) {
    input.webkitdirectory = type === 'dir'
    // 清除旧的监听器
    input.onchange = null
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files || []) as File[]
      if (files.length > 0) {
        await processFiles(files)
      }
      input.value = ''
    }
    input.click()
  }
}

const handleAreaClick = () => {
  uploadFn('file')
}

// 实际逻辑由 handleAreaClick 和 uploadFn触发
// 或者如果拖拽触发，会调用 handlePictureBoxDrop
const handleChange = (uploadFile: any, uploadFiles: any[]) => {
  uploadRef.value?.clearFiles()
  // 让页面获取焦点
  nextTick(() => {
    const dialogDom = document.querySelector('.el-dialog') as HTMLElement
    dialogDom?.focus()
  })
}

const processFiles = async (newFiles: File[]) => {
  if (newFiles.length === 0) return

  loading.value = true
  try {
    // 构建包含路径的传输对象
    const items = newFiles.map(f => {
      const uid = Date.now().toString(36) + Math.random().toString(36).slice(2)
      rawFileMap.value.set(uid, f)
      return {
        uid,
        name: f.name,
        size: f.size,
        path: (f as any).webkitRelativePath || f.name,
      }
    })

    const result = await callWorker('PARSE_FILES', { items })
    if (result) {
      // 这里 result 是第一层的节点列表
      const existNames = new Set(fileList.value.map(item => item.name))
      const filterFiles: any[] = []
      const newFilesList: any[] = []

      result.forEach((item: any) => {
        if (existNames.has(item.name)) {
          filterFiles.push(item.name)
        } else {
          newFilesList.push(item)
          existNames.add(item.name)
        }
      })

      // if (filterFiles.length > 0) {
      //   notify({
      //     title: t('oss.tip'),
      //     message: `重复文件已过滤: ${filterFiles.join(',')}`,
      //     type: 'warning',
      //   })
      // }

      fileList.value = [...fileList.value, ...newFilesList]
    }
  } catch (e) {
    console.error('Parse files error:', e)
  } finally {
    loading.value = false
  }
}

// const loadChildren = async (tree: any, treeNode: unknown, resolve: (data: any[]) => void) => {
//   try {
//     const result = await callWorker('GET_SUB_FILES', {
//       uid: tree.uid,
//       _rootId: tree._rootId,
//       _prefix: tree._prefix,
//     })
//     resolve(result || [])
//   } catch (error) {
//     console.error('Load children error:', error)
//     resolve([])
//   }
// }

const delFileList = async (row: any) => {
  // 1. UI 更新
  if (!row._parentId) {
    // 顶层节点
    fileList.value = fileList.value.filter(item => item.uid !== row.uid)
  } else {
    // 子节点，从 lazyTreeNodeMap 中移除
    const store = fileTableRef.value?.store
    const parentId = row._parentId
    if (store && store.states.lazyTreeNodeMap.value[parentId]) {
      const children = store.states.lazyTreeNodeMap.value[parentId]
      const index = children.findIndex((item: any) => item.uid === row.uid)
      if (index > -1) {
        children.splice(index, 1)
      }
    }
  }

  // 2. 通知 Worker 清理缓存和更新父节点大小
  const res = await callWorker('DELETE_NODE', {
    uid: row.uid,
    _rootId: row._rootId,
    _parentId: row._parentId,
    isFolder: row.isFolder,
    _prefix: row._prefix,
    _fullPath: row._fullPath,
  })

  if (res && !res.isRoot && res.newSize !== undefined && row._parentId) {
    const rootItem = fileList.value.find(item => item.uid === row._rootId)
    if (rootItem) {
      rootItem.size = res.newSize
    }
  }
}

const handlePictureBoxDrop = async (e: any) => {
  e.preventDefault()
  e.stopPropagation()
  const items = e.dataTransfer?.items
  if (!items) return

  loading.value = true
  try {
    const files: File[] = []
    const dirEntries: any[] = []

    // 分类收集文件和目录
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.()
      if (!entry) continue
      if (entry.isFile) {
        const file = items[i].getAsFile?.()
        if (file) files.push(file)
      } else if (entry.isDirectory) {
        dirEntries.push(entry)
      }
    }

    // 递归处理目录，收集所有文件
    const processDirectory = async (directoryEntry: any, path = '') => {
      const reader = directoryEntry.createReader()
      const subEntries = await new Promise<any[]>(resolve => {
        reader.readEntries(resolve)
      })
      for (const entry of subEntries) {
        if (entry.isFile) {
          const file = await new Promise<File>(resolve => {
            entry.file((file: File) => {
              Object.defineProperty(file, 'webkitRelativePath', {
                value: path ? `${path}/${entry.name}` : entry.name,
                writable: false,
              })
              resolve(file)
            })
          })
          files.push(file)
        } else if (entry.isDirectory) {
          await processDirectory(entry, path ? `${path}/${entry.name}` : entry.name)
        }
      }
    }

    for (const entry of dirEntries) {
      await processDirectory(entry, entry.name)
    }

    if (files.length > 0) {
      await processFiles(files)
    }
    // 清除el-upload-dragger元素的is-dragover类名
    const dragger = uploadRef.value?.$el.querySelector('.el-upload-dragger') as HTMLElement
    dragger.classList.remove('is-dragover')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const beforeUpload = () => false // 阻止默认上传

let notification: any = null
const submit = async () => {
  try {
    loading.value = true

    const tokenRes = await _getUploadStsToken({
      region: route.params.region as string,
      bucketName: route.params.name as string,
    })
    const sts = tokenRes?.data ?? tokenRes

    if (!fileList.value.length) return
    const folderPath = ossStore.folders.join('/')
    const prefix = folderPath ? `${folderPath}/` : ''
    // 1. 调用 Worker 准备上传列表（树形结构）
    const uploadList = await callWorker('PREPARE_UPLOAD', { uids: fileList.value.map(f => f.uid) })

    // 2. 递归恢复 File 对象
    const restoreRawFiles = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.isFolder) {
          if (node.files) {
            restoreRawFiles(node.files)
          }
        } else {
          // 关键,获取文件对象,因为之前给worker的只有name,size,type等信息,没有文件对象,这步是整理好后,重新赋值
          const file = rawFileMap.value.get(node.uid)
          if (file) {
            node.raw = file
          }
        }
      }
      return nodes
    }

    const allFilesToUpload = restoreRawFiles(uploadList).filter(item => item.status !== 'error')

    console.log(allFilesToUpload, 'allFilesToUpload')

    // 生成任务名
    const pad = (n: number) => String(n).padStart(2, '0')
    const now = new Date()
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(Number(getDateDayjs(maoYunDayJs())))}${pad(
      now.getHours(),
    )}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const taskName = t('oss.fileList.uploadTask', [ts])

    if (allFilesToUpload.length > 0) {
      notification && notification.close()
      notification = notify({
        message: t('oss.fileList.uploadingFile'),
        icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
        offset: 100,
        duration: 1000,
      })
      // 添加任务记录
      const taskId = await db.tasks.add({
        taskName,
        status: 1,
        progress: 0,
        tasking: 0,
        taskNumber: 0,
        type: 'upload',
      })

      // 交给 uploadTaskManager 管理并上传
      createAndStartTask(taskId, allFilesToUpload, sts, updata.value, prefix, route.params.name as string)
      updata.value = {
        'x-oss-acl': 'default',
        'x-oss-server-side-encryption': 'default',
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
    fileList.value = []
    // 清理 Worker 缓存
    callWorker('CLEAR_CACHE', {})
    rawFileMap.value.clear()

    // 立即收起弹窗
    emit('update:show', false)
  }
}

// 弹窗打开
const open = async () => {
  emit('update:show', true)
}

// 弹窗关闭
const cancel = () => {
  emit('update:show', false)
}

watch(dialogVisible, newVal => {
  if (!newVal) {
    // 重置表单数据
    fileList.value = []
    callWorker('CLEAR_CACHE', {})
    rawFileMap.value.clear()
  } else {
    nextTick(() => {
      const overlay = document.querySelector('.el-overlay')

      if (overlay) {
        // overlay.addEventListener('click', handleAreaClick)
        overlay.addEventListener('dragover', e => {
          e.preventDefault()
          e.stopPropagation()
        })
        overlay.addEventListener('drop', handlePictureBoxDrop)
      }
    })
  }
})

// 定义常量提高代码可维护性
const ROW_HEIGHT = 50
const MIN_HEIGHT_DIFF = 490 // 690不会出现滚动条

watch(fileList, newList => {
  // 计算文件数量变化
  const diff = newList.length
  console.log(diff)

  // 如果没有变化，直接返回
  if (diff === 0) return
  // const dialog = document.querySelector('.el-dialog') as HTMLElement | null
  // if (dialog) {
  //   dialog.style.height = '90vh'
  // }

  nextTick(() => {
    // 计算新的高度值
    let newHeight = diff * ROW_HEIGHT

    // 获取对话框高度，使用更可靠的方式
    const dialogDom = document.querySelector('.el-dialog')
    if (dialogDom?.clientHeight) {
      // 确保高度不会超过对话框允许的最大高度
      const maxHeight = dialogDom.clientHeight - MIN_HEIGHT_DIFF
      maxTableHeight.value = maxHeight
      console.log(maxHeight, newHeight)
    }
    tableHeightBox.value = newHeight
  })
})

onBeforeUnmount(() => {
  worker.terminate()
  const overlay = document.querySelector('.el-overlay')
  if (overlay) {
    overlay.removeEventListener('click', handleAreaClick)
    overlay.removeEventListener('dragover', e => e.preventDefault())
    overlay.removeEventListener('drop', handlePictureBoxDrop)
  }
})
</script>

<style lang="scss" scoped>
.el-radio-group :deep(.el-radio.is-checked) .el-radio__input .el-radio__inner {
  background: var(--success-color);
  border: 1px solid var(--success-color);
}

.upload-demo {
  :deep(.el-upload-dragger) {
    padding: 0 !important;

    .upload-wrap {
      padding: 40px 10px;
    }
  }
}

.title_desc {
  font-size: 14px;
  font-weight: 400;
  color: #000;

  .label {
    margin-right: 20px;
    color: #999;
  }
}

.file-info {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 400;
  color: #555;
}

.el-collapse {
  border: none;

  :deep(.el-collapse-item__content) {
    padding: 0;
  }

  :deep(.el-collapse-item__header) {
    border: none;

    .el-collapse-item__arrow {
      display: none;
    }
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
  }

  .collapse-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #000;

    .el-icon {
      font-size: 18px;
      color: #999;
    }
  }
}

.form {
  .form-item {
    display: flex;
    gap: 20px;
    line-height: 34px;

    .label,
    .desc {
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }
  }

  .form-item + .form-item {
    margin-top: 20px;
  }
}

.folder-item {
  display: inline-block;
}

:deep(.el-table-v2) {
  .el-table-v2__header .el-table-v2__header-cell {
    font-family: 'PingFang SC', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #555;
    background-color: #f9fafc;
  }

  .ellipsis-tooltip {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .columns_name {
    width: 45% !important;
    min-width: 220px;
    white-space: nowrap;
  }

  .columns_size {
    width: 15% !important;
    min-width: 120px;
  }

  .columns_status {
    width: 20% !important;
    min-width: 160px;
  }

  .columns_operation {
    width: 20% !important;
    min-width: 100px;
  }
}
</style>
