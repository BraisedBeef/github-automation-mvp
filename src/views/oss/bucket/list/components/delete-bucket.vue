<template>
  <div>
    <!-- 删除桶 -->
    <CatDialog
      v-if="dialogVisible"
      v-model:dialog="dialogVisible"
      :title="t('oss.fileList.confirmDeleteBucket')"
      :width="680"
      icon="warn-red"
    >
      <div class="df fdc">
        <p class="" style="color: #999">
          <span class="label">{{ t('oss.bucketName') }}：</span>
          <span style="color: #000">{{ currSelectBucket.name }}</span>
        </p>
        <p style="margin-top: 12px; color: #999">
          <i18n-t keypath="oss.fileList.deleteBucketTip">
            <span style="color: #000"> {{ t('oss.fileList.deleteBucketTip1') }} </span>
          </i18n-t>
        </p>
        <div class="steps">
          <el-steps direction="vertical" :active="1">
            <el-step status="wait">
              <template #icon>
                <SvgIcon :name="statusInfo.file" style="font-size: 16px" />
              </template>
              <template #title>
                <p style="color: rgb(0 0 0 / 88%)">
                  {{ t('oss.fileList.fileHistory') }}
                </p>
              </template>
              <template #description>
                <p v-if="statusInfo.file === 'loading'">
                  {{ t('oss.fileList.checking') }}
                </p>
                <p v-else-if="statusInfo.file === 'success-icon'">
                  {{ t('oss.fileList.deletedFileHistory') }}
                </p>
                <p v-else>
                  {{ t('oss.fileList.pleaseDeleteFileHistory')
                  }}<span style="color: #0063ff; cursor: pointer" @click="toClearBucket">{{
                    t('oss.fileList.goClearBucket')
                  }}</span>
                </p>
              </template>
            </el-step>
            <el-step status="wait">
              <template #icon>
                <SvgIcon :name="statusInfo.fileFragment" style="font-size: 16px" />
              </template>
              <template #title>
                <p style="color: rgb(0 0 0 / 88%)">
                  {{ t('oss.fileList.fileFragments') }}
                </p>
              </template>
              <template #description>
                <p v-if="statusInfo.fileFragment === 'loading'">
                  {{ t('oss.fileList.checking') }}
                </p>
                <p v-else-if="statusInfo.fileFragment === 'success-icon'">
                  {{ t('oss.fileList.deletedFileFragments') }}
                </p>
                <p v-else>
                  {{ t('oss.fileList.pleaseDeleteFileFragments') }}
                </p>
              </template>
            </el-step>
            <!-- <el-step status="wait">
              <template #icon>
                <SvgIcon :name="statusInfo.cdn" style="font-size: 16px"></SvgIcon>
              </template>
              <template #title>
                <p style="color: rgba(0, 0, 0, 0.88)">{{ t('oss.fileList.boundCdnDomain') }}</p>
              </template>
              <template #description>
                <p v-if="statusInfo.cdn === 'loading'">{{ t('oss.fileList.checking') }}</p>
                <p v-else-if="statusInfo.cdn === 'success-icon'">{{ t('oss.fileList.closedCdnDomain') }}</p>
                <p v-else>
                  {{ t('oss.fileList.closedCdnDomain')
                  }}<span style="color: #0063ff">{{ t('oss.fileList.goClose') }}</span>
                </p>
              </template>
            </el-step> -->
          </el-steps>
        </div>
      </div>
      <template #footer>
        <div class="cat-dialog-footer">
          <el-button type="primary" class="mb20" @click="confirmChange">
            {{ t(canDelete ? t('oss.fileList.deleteBucket') : t('oss.fileList.recheck')) }}
          </el-button>
          <el-button class="mb20" @click="dialogVisible = false">
            {{ t('oss.cancel') }}
          </el-button>
        </div>
      </template>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import { _deleteStorage, _getStorageObjectList, _listMultipartUploads } from '@/apis/oss/storage-list'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import t from '@/utils/i18n'
import { notify } from '@/utils/notification'

const props = defineProps<{ show: boolean; currSelectBucket: any }>()
const emit = defineEmits(['update:show', 'toClearBucket', 'success'])

const dialogVisible = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

type StatusInfo = 'loading' | 'warn-warning' | 'success-icon'

const statusInfo = ref<{ file: StatusInfo; fileFragment: StatusInfo; cdn: StatusInfo }>({
  file: 'loading',
  fileFragment: 'loading',
  cdn: 'loading',
})

// 根据statusInfo判断是否可以删除
const canDelete = computed(() => {
  return statusInfo.value.file === 'success-icon' && statusInfo.value.fileFragment === 'success-icon'
})

let notification: any = null
const confirmChange = () => {
  if (canDelete.value) {
    // 删除桶
    console.log('删除桶')
    notification = notify({
      message: t('oss.fileList.deletingBucket'),
      icon: h(SvgIcon, { name: 'loading', style: 'font-size: 16px' }),
      offset: 100,
    })
    _deleteStorage({
      bucketName: props.currSelectBucket.name,
      region: props.currSelectBucket.region,
    }).then(() => {
      notification && notification.close()
      notify.success({
        message: t('oss.fileList.deleteBucket'),
        offset: 100,
        duration: 5000,
      })
      emit('success')
    })
    emit('update:show', false)
  } else {
    // 重新检测
    checkBucket()
  }
}

// 检测桶数据
const checkBucket = () => {
  // 检测文件/历史版本
  statusInfo.value.file = 'loading'
  // 检测文件碎片
  statusInfo.value.fileFragment = 'loading'
  // 检测绑定的CDN加速域名
  // statusInfo.value.cdn = 'loading'

  // 文件碎片
  _listMultipartUploads({
    bucketName: props.currSelectBucket.name,
    region: props.currSelectBucket.region,
  }).then(res => {
    if (res.code === 200) {
      if (res.data?.uploads?.length > 0) {
        statusInfo.value.fileFragment = 'warn-warning'
      } else {
        statusInfo.value.fileFragment = 'success-icon'
      }
    } else {
      statusInfo.value.fileFragment = 'success-icon'
    }
  })

  // 文件/历史版本
  _getStorageObjectList({
    bucketName: props.currSelectBucket.name,
    region: props.currSelectBucket.region,
    maxKeys: 10,
  }).then(res => {
    if (res.data && res.data.list && res.data.list.length === 0) {
      statusInfo.value.file = 'success-icon'
    } else {
      statusInfo.value.file = 'warn-warning'
    }
  })

  statusInfo.value.cdn = 'success-icon'
}

const toClearBucket = () => {
  emit('toClearBucket')
}

watch(
  () => dialogVisible.value,
  newVal => {
    if (newVal) {
      checkBucket()
    }
  },
)
</script>

<style lang="scss" scoped>
.steps {
  height: 210px;
  margin-top: 20px;
}
</style>
