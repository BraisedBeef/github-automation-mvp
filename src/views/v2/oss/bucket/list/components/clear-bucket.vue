<template>
  <div>
    <!-- 清空桶 -->
    <CatDialog
      v-if="dialogVisible"
      v-model:dialog="dialogVisible"
      :title="t('oss.fileList.confirmClearBucket')"
      :width="680"
      icon="warn-red"
    >
      <div class="df fdc">
        <p class="" style="color: #ff3546">
          {{ t('oss.fileList.clearBucketWarning') }}
        </p>
        <p class="mt20" style="color: #999">
          {{ t(`oss.fileList.enterBucketName`) }}
          <span style="color: #000">{{ currSelectBucket.name }}</span>
          {{ t(`oss.fileList.confirmClearOperation`) }}
        </p>

        <el-input v-model="bucketName" class="mt20" :placeholder="t(`oss.fileList.enterBucketName`)" />
      </div>
      <template #footer>
        <div class="cat-dialog-footer">
          <el-button
            :disabled="!isBucketName"
            type="primary"
            class="mb20"
            @click="((confirmClearBucketDialog = true), (dialogVisible = false))"
          >
            {{ t('oss.fileList.confirmClear') }}
          </el-button>
          <el-button class="mb20" @click="dialogVisible = false">
            {{ t('oss.cancel') }}
          </el-button>
        </div>
      </template>
    </CatDialog>
    <!-- 确认清空桶 -->
    <CatDialog
      v-if="confirmClearBucketDialog"
      v-model:dialog="confirmClearBucketDialog"
      :title="$t('oss.fileList.confirmClearBucketOperation')"
      :width="680"
      icon="warn-red"
      @confirm="clearBucketConfirm"
    >
      <p style="color: #999">
        <i18n-t keypath="oss.fileList.confirmClearBucketTip">
          <span style="color: #000">{{ t('oss.fileList.clearBucketTip') }}</span>
        </i18n-t>
      </p>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import { _clearStorageBucket } from '@/apis/oss/storage-list'
import t from '@/utils/i18n'
import SvgIcon from '@/components/common/svg-icon/index.vue'

import { useTaskManager } from '@/views/oss/hooks/use-task-manager'
import { TaskType } from '../../../types'
import { notify } from '@/utils/notification'

const props = defineProps<{ show: boolean; currSelectBucket: any }>()
const emit = defineEmits(['update:show', 'success'])

const { addTask } = useTaskManager()

const dialogVisible = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

const confirmClearBucketDialog = ref(false)
const bucketName = ref('')

let notification: any = null

const isBucketName = computed(() => {
  return props.currSelectBucket.name === bucketName.value
})

// 在 ClearBucket.vue 中
const clearBucketConfirm = async () => {
  notification = notify({
    message: t('oss.fileList.clearingBucket'),
    icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
    offset: 100,
    duration: 3000,
  })
  const res = await _clearStorageBucket({
    region: props.currSelectBucket.region,
    bucketName: props.currSelectBucket.name,
    mode: 'all',
  })

  if (res.code === 200) {
    const { taskId } = res.data
    const onTaskComplete = task => {
      console.log('onTaskComplete', task)

      notification && notification.close()
      notify.success({
        message: t('oss.fileList.bucketCleared'),
        offset: 100,
        duration: 3000,
      })

      emit('success', true)
    }
    addTask({ taskId, type: TaskType.CLEAR_BUCKET }, onTaskComplete)

    confirmClearBucketDialog.value = false
    emit('update:show', false)
  }
}

watch(
  () => props.show,
  newVal => {
    if (newVal) {
      bucketName.value = ''
    }
  },
)
</script>
