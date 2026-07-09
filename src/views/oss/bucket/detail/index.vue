<template>
  <div class="h-full df fdc">
    <div class="">
      <PageHeader :back-title="t('oss.fileList.backToBucketList')" back-name="bucket">
        <template #title>
          <div class="df ac">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>
                <p class="text-primary pointer mr4" @click="changeFolder('')">
                  {{ title }}
                </p>
              </el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in folders" :key="index">
                <p class="text-primary pointer mr4" @click="changeFolder(item)">
                  {{ item }}
                </p>
              </el-breadcrumb-item>
            </el-breadcrumb>
            <Copy :text="copyTitle" hide-text />
          </div>
        </template>
        <template #right_content>
          <div class="btn-wrap pd0-20">
            <SvgIcon name="cat_task" pointer />
            <DisableText :disabled="false" :text="t('oss.fileList.taskCenter')" @click="openTask" />
          </div>
        </template>
      </PageHeader>

      <div class="df jsb ac tabs-wrap">
        <!-- tabs -->
        <div class="df">
          <CatTabs v-model="active" class="tabs" :tabs="tabs" @change="changeTab" />
        </div>
      </div>
    </div>

    <div style="flex: 1; height: 0; padding: 20px">
      <Overview v-if="active === 1" />
      <FileList v-if="active === 2" ref="fileListRef" :folders="folders" @change-title="changeTitle" />
      <DomainConfig v-if="active === 3" />
      <DataMonitor v-if="active === 4" />
      <SafetyManagement v-if="active === 5" />
      <PermissionManagement v-if="active === 6" />
    </div>
    <!-- 任务列表 -->
    <TaskList v-model:show="taskDialog" />
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { useOssStore, useTempStore } from '@/store'

import Overview from './components/overview.vue'
import FileList from './components/file-list.vue'
import DataMonitor from './components/data-monitor.vue'
import DomainConfig from './components/domain-config.vue'
import SafetyManagement from './components/safety-management.vue'
import PermissionManagement from './components/permission-management.vue'
import { _getBucketEncryption } from '@/apis/oss/storage-list'
import { BucketInfo } from '../../hooks/use-oss'
import TaskList from './components/task-list.vue'
import { replaceRoute } from '@/utils/router-jump'

const route = useRoute()
const currSelectBucket = reactive<BucketInfo>({
  name: String(route.params.name).split('/')[0],
  region: String(route.params.region),
  sseAlgorithm: '',
})
// 当前桶信息
provide('currSelectBucket', currSelectBucket)

const v = route.query.active as string
const active = ref(v ? Number(v) : 2)
const tabs = [
  { label: t('oss.fileList.overview'), value: 1 }, // 概览
  { label: t('oss.fileList.fileList'), value: 2 }, // 文件列表
  { label: t('oss.fileList.safetyManagement'), value: 5 }, // 安全管理
  { label: t('oss.fileList.permissionManagement'), value: 6 }, // 权限管理
  { label: t('oss.fileList.DomainConfig'), value: 3 }, // 域名配置
  // { label: t('oss.fileList.dataMonitoring'), value: 4 }, // 数据监控
]

const fileListRef = ref<InstanceType<typeof FileList> | null>(null)
const taskDialog = ref(false)

const title = computed(() => {
  return String(route.params.name)
})

const ossStore = useOssStore()
// 文件夹路径数组e
const folders = computed(() => ossStore.folders)

const copyTitle = computed(() => {
  const bucketName = String(route.params.name)
  const currentPath = folders.value.join('/')
  return currentPath ? `${bucketName}/${currentPath}` : bucketName
})

const changeTitle = (val: string) => {
  ossStore.updateFolders([...val.split('/')].filter(Boolean))
}

const changeTab = tab => {
  console.log(`changeTab===>`, tab)
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
  // fileListRef.value?.openTaskDialog()
}

// 切换文件夹
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

// 获取桶加密信息
const getBucketEncryption = async () => {
  const bucketName = String(route.params.name)
  const region = String(route.params.region)
  const res = await _getBucketEncryption({ bucketName, region })
  console.log(res.data.sseAlgorithm)
  currSelectBucket.sseAlgorithm = res.data.sseAlgorithm
}

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
.btn-wrap {
  display: flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
}

.tabs-wrap {
  box-sizing: border-box;
  background: #fff;

  :deep(.cat-tabs__header) {
    border-color: transparent;
  }
}
</style>
