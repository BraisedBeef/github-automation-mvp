<template>
  <el-drawer v-model="drawer" size="60%" direction="rtl" class="task-drawer" :before-close="handleClose">
    <template #header>
      <p class="title">
        {{ t('oss.fileList.fileFragmentManagement') }}
      </p>
    </template>
    <div class="ff_container df">
      <div class="operation">
        <el-button type="primary" :disabled="dataList.length === 0" @click="deleteFragmentation({}, 'clear')">
          {{ t('oss.fileList.clearFragments') }}
        </el-button>
        <el-input
          v-model="searchVal"
          style="width: 240px"
          :placeholder="t('oss.fileList.enterFileName')"
          @keydown.enter="getFragmentationList"
        >
          <template #suffix>
            <SvgIcon style="cursor: pointer" name="dns-search" @click="getFragmentationList" />
          </template>
        </el-input>
      </div>

      <el-table v-loading="loading" :data="dataList" tooltip-effect="light">
        <el-table-column min-width="100" :label="t('oss.fileList.fragmentFileName')" prop="key" show-overflow-tooltip />
        <el-table-column
          min-width="100"
          :label="t('oss.fileList.uploadTaskId')"
          prop="uploadId"
          show-overflow-tooltip
        />
        <el-table-column min-width="100" :label="t('oss.createTime')" show-overflow-tooltip>
          <template #default="{ row }">
            <div>{{ row.initiated ? maoYunDayJs(row.initiated * 1000).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" width="200" :label="$t('oss.operation')">
          <template #default="{ row }">
            <div class="df ac" style="gap: 24px">
              <DisableText :disabled="false" :text="t('oss.fileList.moreInfo')" @click="detailFragmentation(row)" />
              <DisableText :disabled="false" :text="t('oss.delete')" @click="deleteFragmentation(row, 'delete')" />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <CatDialog
        v-if="detailDialog"
        v-model:dialog="detailDialog"
        :title="t('oss.fileList.multipartUploadInfo')"
        :width="550"
      >
        <div class="detail_info">
          <div class="df ac">
            <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.objectPath') }}</span>
            <span>{{ detailInfo.key ? detailInfo.key : '-' }}</span>
          </div>
          <!-- <div class="df">
            <span class="label" :style="{ width: labelWidth }">上传发起者ID</span>
            <span>1234567890</span>
          </div>
          <div class="df">
            <span class="label" :style="{ width: labelWidth }">对象所有者ID</span>
            <span>1234567890</span>
          </div> -->
          <div class="df">
            <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.uploadedSize') }}</span>
            <span>{{ detailInfo.totalSize ? formatFileSize(detailInfo.totalSize) : '-' }}</span>
          </div>
          <div class="df">
            <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.uploadedFragmentCount') }}</span>
            <span>{{ detailInfo.partCount ? detailInfo.partCount : '-' }}</span>
          </div>
          <div class="df">
            <span class="label" :style="{ width: labelWidth }">{{ t('oss.createTime') }}</span>
            <span>{{ detailInfo.initiated ? maoYunDayJs(detailInfo.initiated * 1000).format(FORMAT_TIME) : '-' }}</span>
          </div>
          <div class="df">
            <span class="label" :style="{ width: labelWidth }">{{ t('oss.fileList.uploadTaskId') }}</span>
            <span>{{ detailInfo.uploadId ? detailInfo.uploadId : '-' }}</span>
          </div>
        </div>

        <template #footer>
          <div class="df ac jc">
            <el-button @click="detailDialog = false">
              {{ t('oss.close') }}
            </el-button>
          </div>
        </template>
      </CatDialog>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import {
  _abortMultipartUpload,
  _clearStorageBucket,
  _getMultipartUploadDetail,
  _listMultipartUploads,
} from '@/apis/oss/storage-list'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import { LANGUAGE_MAP } from '@/config/constant-config'
import t from '@/utils/i18n'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { useTaskManager } from '@/views/oss/hooks/use-task-manager'
import { TaskType, TaskTypeRes } from '@/views/oss/types'
import { encodeToSafeBase64, formatFileSize } from '@/views/oss/utils/upload'
import { ElMessageBox } from 'element-plus'
import { notify } from '@/utils/notification'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const labelWidth = useI18nStyle({
  [ja]: '120px',
  [en]: '120px',
  [zh]: '120px',
})

const props = defineProps<{ show: boolean; currSelectBucket: any }>()
const emit = defineEmits(['update:show', 'deleteSuccess'])

const { addTask } = useTaskManager()

const drawer = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

const searchVal = ref('')
const loading = ref(false)
const dataList = ref([])
const detailDialog = ref(false)

const detailInfo = ref<any>({})

// notification 的实例
let notification: any = null

const handleClose = () => {
  drawer.value = false
}

const detailFragmentation = async row => {
  console.log(row)
  const base64Key = encodeToSafeBase64(row.key)
  const res = await _getMultipartUploadDetail({
    key: base64Key,
    uploadId: row.uploadId,
    bucketName: props.currSelectBucket.name,
    region: props.currSelectBucket.region,
  })
  console.log('res===>', res)
  detailInfo.value = res.data
  detailDialog.value = true
}

// 删除碎片、清空碎片
const deleteFragmentation = (row, type: 'delete' | 'clear') => {
  console.log(row, type)

  ElMessageBox.confirm(
    t(
      type === 'delete'
        ? `<p>${t('oss.fileList.confirmDeletePath')} <span style="word-wrap: break-word;color: #0063FF">${row.key}</span> ${t('oss.fileList.confirmDeletePathTip')}</p>`
        : t('oss.fileList.ensureClearAllFragments'),
    ),
    t(type === 'delete' ? t('oss.fileList.deleteFileFragments') : t('oss.fileList.clearFragments')),
    {
      confirmButtonText: t('oss.confirm'),
      cancelButtonText: t('oss.cancel'),
      dangerouslyUseHTMLString: type === 'delete',
      customClass: 'clear_bucket_confirm',
      customStyle: {
        width: '550px',
        maxWidth: 'none',
      },
    },
  )
    .then(async () => {
      notification = notify({
        message: t('oss.fileList.clearingFragments'),
        icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
        offset: 100,
      })
      if (type === 'delete') {
        await _abortMultipartUpload({
          key: encodeToSafeBase64(row.key),
          uploadId: row.uploadId,
          bucketName: props.currSelectBucket.name,
          region: props.currSelectBucket.region,
        })
        notification && notification.close()
        notify.success({
          message: t('oss.fileList.deleteSuccess'),
          offset: 100,
          duration: 3000,
        })

        getFragmentationList()
      } else {
        const res = await _clearStorageBucket({
          bucketName: props.currSelectBucket.name,
          region: props.currSelectBucket.region,
          mode: 'fragment',
        })
        if (res.code === 200) {
          const { action, taskId } = res.data

          addTask({ taskId, type: TaskType.CLEAR_BUCKET, isAddTask: true }, (data: any) => {
            if (data.type === TaskTypeRes.CLEAR_BUCKET_RES) {
              notification && notification.close()
              notify.success({
                message: t('oss.fileList.deleteSuccess'),
                offset: 100,
                duration: 3000,
              })
              getFragmentationList()
            }
          })
        }
      }
      emit('deleteSuccess')
    })
    .catch(() => {})
}

// 获取文件碎片列表
const getFragmentationList = async () => {
  const res = await _listMultipartUploads({
    bucketName: props.currSelectBucket.name,
    region: props.currSelectBucket.region,
    prefix: searchVal.value,
  })
  dataList.value = res.data.uploads || []
}

watch(
  () => drawer.value,
  newVal => {
    if (newVal) {
      getFragmentationList()
    }
  },
)
</script>

<style lang="scss" scoped>
.title {
  font-size: 21px;
  font-weight: 500;
  color: #000;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
}

.ff_container {
  flex-direction: column;

  .operation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
}

.detail_info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
  font-size: 14px;
  font-weight: 400;
  color: #000;
  word-break: break-all;

  .label {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}
</style>

<style lang="scss">
.clear_bucket_confirm {
  .el-message-box__btns {
    flex-direction: row-reverse;
    gap: 20px;
    justify-content: center;
  }
}
</style>
