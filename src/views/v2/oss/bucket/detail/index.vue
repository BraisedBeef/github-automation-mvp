<template>
  <div class="oss-bucket-detail-v2 h-full df fdc">
    <section class="oss-bucket-detail-v2__header">
      <div class="oss-bucket-detail-v2__toolbar">
        <div class="oss-bucket-detail-v2__toolbar-left">
          <div class="oss-bucket-detail-v2__nav">
            <button class="oss-bucket-detail-v2__nav-btn" type="button" @click="backRoute">
              <SvgIcon name="sub-back" />
            </button>
            <button
              class="oss-bucket-detail-v2__nav-btn oss-bucket-detail-v2__nav-btn--forward"
              type="button"
              @click="forwardRoute"
            >
              <SvgIcon name="sub-back" />
            </button>
            <span class="oss-bucket-detail-v2__divider" />
          </div>

          <div class="oss-bucket-detail-v2__breadcrumb">
            <button class="oss-bucket-detail-v2__crumb" type="button" @click="goBucketList">
              {{ t('oss.bucketList') }}
            </button>
            <SvgIcon name="step-arrow" class="oss-bucket-detail-v2__crumb-arrow" />
            <button
              class="oss-bucket-detail-v2__crumb"
              :class="{ 'is-current': !folders.length }"
              type="button"
              @click="changeFolder('')"
            >
              {{ bucketName }}
            </button>
            <template v-for="(item, index) in folders" :key="`${item}-${index}`">
              <SvgIcon name="step-arrow" class="oss-bucket-detail-v2__crumb-arrow" />
              <button
                class="oss-bucket-detail-v2__crumb"
                :class="{ 'is-current': index === folders.length - 1 }"
                type="button"
                @click="changeFolder(item)"
              >
                {{ item }}
              </button>
            </template>
            <Copy class="oss-bucket-detail-v2__copy" :text="copyTitle" hide-text />
          </div>
        </div>

        <div class="oss-bucket-detail-v2__toolbar-actions">
          <button class="oss-bucket-detail-v2__action" type="button" @click="openTask">
            <SvgIcon name="cat_task" />
            <span>{{ t('oss.fileList.taskCenter') }}</span>
          </button>
          <a class="oss-bucket-detail-v2__action" :href="helpDocUrl" target="_blank" rel="noreferrer">
            <SvgIcon name="help-document" />
            <span>{{ t('common.docHelper') }}</span>
          </a>
        </div>
      </div>

      <div class="oss-bucket-detail-v2__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="oss-bucket-detail-v2__tab"
          :class="{ 'is-active': active === tab.value }"
          type="button"
          @click="changeTab(tab)"
        >
          {{ tab.label }}
        </button>
      </div>
    </section>

    <div class="oss-bucket-detail-v2__content">
      <Overview v-if="active === 1" />
      <FileList v-if="active === 2" ref="fileListRef" :folders="folders" @change-title="changeTitle" />
      <DomainConfig v-if="active === 3" />
      <DataMonitor v-if="active === 4" />
      <SafetyManagement v-if="active === 5" />
      <PermissionManagement v-if="active === 6" />
    </div>

    <TaskList v-model:show="taskDialog" />
  </div>
</template>

<script lang="ts" setup>
import { documentUrl } from '@/config/base-config'
import { useOssStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import { backRoute, forwardRoute, pushRoute, replaceRoute } from '@/utils/router-jump'

import Overview from './components/overview.vue'
import FileList from './components/file-list.vue'
import DataMonitor from './components/data-monitor.vue'
import DomainConfig from './components/domain-config.vue'
import SafetyManagement from './components/safety-management.vue'
import PermissionManagement from './components/permission-management.vue'
import { _getBucketEncryption } from '@/apis/oss/storage-list'
import { BucketInfo } from '../../hooks/use-oss'
import TaskList from './components/task-list.vue'

const route = useRoute()
const currSelectBucket = reactive<BucketInfo>({
  name: String(route.params.name).split('/')[0],
  region: String(route.params.region),
  sseAlgorithm: '',
})

provide('currSelectBucket', currSelectBucket)

const v = route.query.active as string
const active = ref(v ? Number(v) : 2)
const tabs = [
  { label: t('oss.fileList.overview'), value: 1 },
  { label: t('oss.fileList.fileList'), value: 2 },
  { label: t('oss.fileList.safetyManagement'), value: 5 },
  { label: t('oss.fileList.permissionManagement'), value: 6 },
  { label: t('oss.fileList.DomainConfig'), value: 3 },
]

const fileListRef = ref<InstanceType<typeof FileList> | null>(null)
const taskDialog = ref(false)

const bucketName = computed(() => {
  return String(route.params.name).split('/')[0]
})

const ossStore = useOssStore()
const folders = computed(() => ossStore.folders)

const copyTitle = computed(() => {
  const currentPath = folders.value.join('/')
  return currentPath ? `${bucketName.value}/${currentPath}` : bucketName.value
})

const helpDocUrl = computed(() => `${documentUrl}document/detail?type=oss`)

const goBucketList = () => {
  pushRoute({ name: 'bucket' })
}

const changeTitle = (val: string) => {
  ossStore.updateFolders([...val.split('/')].filter(Boolean))
}

const changeTab = tab => {
  active.value = tab.value

  if ([2].includes(tab.value)) {
    getBucketEncryption()
  }

  replaceRoute({
    name: 'bucket_detail',
    query: {
      active: tab.value,
    },
  })
}

const openTask = () => {
  taskDialog.value = true
}

const changeFolder = (val: string) => {
  if (val === '') {
    ossStore.clearFolders()
  } else {
    const index = folders.value.indexOf(val)

    if (index > -1) {
      ossStore.updateFolders(folders.value.slice(0, index + 1))
    }
  }

  fileListRef.value?.getFileList(folders.value.join('/'))
}

const getBucketEncryption = async () => {
  const bucketName = String(route.params.name)
  const region = String(route.params.region)
  const res = await _getBucketEncryption({ bucketName, region })
  currSelectBucket.sseAlgorithm = res.data.sseAlgorithm
}

watch(
  () => route.query.active,
  value => {
    active.value = value ? Number(value) : 2
  },
)

onMounted(async () => {
  useTempStore().setPageHeader(false)
  getBucketEncryption()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
  ossStore.clearFolders()
})
</script>

<style lang="scss" scoped>
.oss-bucket-detail-v2 {
  min-height: 0;

  &__header {
    overflow: hidden;
    background: #fff;
  }

  &__toolbar {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    padding: 16px 20px 0 16px;
  }

  &__toolbar-left {
    display: flex;
    gap: 16px;
    align-items: center;
    min-width: 0;
  }

  &__nav {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
  }

  &__nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    color: #b7c0cd;
    cursor: pointer;
    background: transparent;
    border: 0;

    &--forward {
      transform: rotate(180deg);
    }

    &:hover {
      color: #06f;
    }

    :deep(svg) {
      width: 16px;
      height: 16px;
    }
  }

  &__divider {
    width: 1px;
    height: 18px;
    background: #dcdfe6;
  }

  &__breadcrumb {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
  }

  &__crumb,
  &__crumb-arrow {
    flex-shrink: 0;
  }

  &__crumb {
    padding: 0;
    overflow: hidden;
    font-size: 14px;
    line-height: 22px;
    color: #828b9c;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 0;

    &.is-current {
      color: #191c23;
    }

    &:hover {
      color: #06f;
    }
  }

  &__crumb-arrow {
    width: 4px;
    height: 8px;
    margin: 0 10px;
    color: #828b9c;
  }

  &__copy {
    margin-left: 8px;
  }

  &__toolbar-actions {
    display: flex;
    flex-shrink: 0;
    gap: 20px;
    align-items: center;
  }

  &__action {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 0;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    border: 0;

    &:hover {
      color: #06f;
    }

    :deep(svg) {
      width: 16px;
      height: 16px;
    }
  }

  &__tabs {
    display: flex;
    gap: 32px;
    align-items: center;
    padding: 0 20px;
    margin-top: 2px;
    overflow-x: auto;
  }

  &__tab {
    position: relative;
    padding: 10px 0;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;

    &.is-active {
      font-weight: 500;
      color: #06f;
      border-bottom-color: #06f;
    }
  }

  &__content {
    flex: 1;
    height: 0;
    padding-top: 16px;
    overflow: auto;
  }
}

@media (width <= 960px) {
  .oss-bucket-detail-v2 {
    &__toolbar {
      flex-direction: column;
      align-items: flex-start;
      padding-right: 16px;
    }

    &__toolbar-left {
      flex-wrap: wrap;
    }

    &__toolbar-actions {
      flex-wrap: wrap;
      gap: 16px;
    }

    &__tabs {
      padding-right: 16px;
      padding-left: 16px;
    }
  }
}
</style>
