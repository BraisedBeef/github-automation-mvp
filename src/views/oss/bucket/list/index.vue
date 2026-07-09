<template>
  <div>
    <PageHeader :title="t('oss.bucketList')">
      <template #right_content>
        <div class="btn-wrap pd0-20">
          <SvgIcon name="cat_task" pointer />
          <DisableText :disabled="false" :text="t('oss.fileList.taskCenter')" @click="openTask" />
        </div>
      </template>
    </PageHeader>
    <div class="pd20">
      <div class="page-box pd20">
        <div class="df jsb flex-wrap">
          <div class="btn-wrap mr20">
            <!-- 新建 -->
            <el-button type="primary" class="mb20" @click="createBucketFn">
              {{ $t('oss.createBucket') }}
            </el-button>
            <el-button class="mb20" @click="buyPackageFn">
              {{ $t('oss.buyPackage') }}
            </el-button>
            <!-- <el-button class="mb20" :disabled="selectList.length === 0">{{ $t('oss.batchSetPermissions') }}</el-button> -->
          </div>

          <div class="search-wrap df mb20">
            <div>
              <el-input
                v-model="search.bucketName"
                style="width: 460px"
                :placeholder="
                  search.key === 1 ? t('oss.pleaseEnterBucketName') : t('oss.tagKeyAndValueSeparatedBySemicolon')
                "
                @keydown.enter="getList"
              >
                <template #prepend>
                  <el-select v-model="search.key" style="width: 132px; background: #fff">
                    <el-option :label="t('oss.bucketName')" :value="1" />
                    <!-- <el-option :label="t('oss.tag')" :value="2" /> -->
                  </el-select>
                </template>
                <template #suffix>
                  <SvgIcon
                    v-if="search.bucketName"
                    style="cursor: pointer"
                    name="transfer-delete"
                    @click="search.bucketName = ''"
                  />
                  <div class="ml10" />
                  <SvgIcon style="cursor: pointer" name="dns-search" @click="getList" />
                </template>
              </el-input>
            </div>
            <CdnIconButton class="ml10" @click="changeShow(settingTableColumRef)">
              <SvgIcon name="cat-cdn-set" />
            </CdnIconButton>
            <CdnIconButton :type="selectList.length > 0 ? 'primary' : ''" plain @click="exportOpen">
              <SvgIcon :color="selectList.length > 0 ? '#fff' : ''" name="cat-cdn-download" />
            </CdnIconButton>
            <CdnIconButton class="ml10" @click="refresh">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="dataList"
          :max-height="tableHeight"
          tooltip-effect="light"
          @selection-change="handleRowSelectChange"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column
            v-if="visibleColumns.includes(1)"
            min-width="220"
            class-name="file-name-column"
            show-overflow-tooltip
          >
            <template #header>
              <div class="df ac">
                <span>{{ $t('oss.bucketName') }}</span>
                <el-tooltip :content="$t('oss.bucketRenameNotSupported')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div class="text-primary pointer mr4" style="display: block">
                <el-tooltip :content="row.name" placement="top" effect="light">
                  <TableCopy :text="row.name" @handle-click="toDetail(row)" />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="visibleColumns.includes(2)" min-width="120" :label="$t('oss.tagCount')" />
          <el-table-column v-if="visibleColumns.includes(3)" min-width="180" :label="$t('oss.accessPermissions')">
            <template #default="{ row }">
              <div>{{ row.access_label }}</div>
            </template>
          </el-table-column>

          <el-table-column v-if="visibleColumns.includes(4)" min-width="100" :label="t('oss.region')">
            <template #header>
              <CatTableHeadFilter
                ref="stateThFilterRef"
                v-model="search.region"
                :label="t('oss.region')"
                :show-all="false"
                :list="[
                  { label: t('oss.all'), value: 'all' },
                  { label: t('oss.日本东京'), value: 'ap-guangzhou' },
                ]"
                @change="getList"
              />
            </template>
            <template #default="{ row }">
              <div class="df ac">
                {{ row.region === 'ap-guangzhou' ? t('oss.日本东京') : '-' }}
              </div>
            </template>
          </el-table-column>

          <el-table-column v-if="visibleColumns.includes(5)" min-width="150">
            <template #header>
              <div class="df ac">
                <span>{{ $t('oss.storage') }}</span>
                <el-tooltip :content="$t('oss.storageTip')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ formatFileSize(row.storageSize || 0) }}</div>
            </template>
          </el-table-column>

          <el-table-column v-if="visibleColumns.includes(6)" min-width="220" :label="t('oss.createTime')">
            <template #header>
              <div class="df ac">
                <span>{{ t('oss.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
                <div class="ml10" />
                <SvgIcon
                  :name="!search.sortOrder ? 'sort' : search.sortOrder === 'asc' ? 'sort-up' : 'sort-down'"
                  @click="sortOrdersChange"
                />
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row.createDate ? maoYunDayJs(row.createDate * 1000).format(FORMAT_TIME) : '-' }}</div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column
            v-if="visibleColumns.includes(7)"
            fixed="right"
            :width="operationWidth"
            :label="$t('oss.operation')"
          >
            <template #default="{ row }">
              <div class="df ac" style="gap: 24px">
                <DisableText :disabled="false" :text="t('oss.configManagement')" @click="toDetail(row, 1)" />
                <el-tooltip placement="bottom" effect="light">
                  <template #content>
                    <div class="more-list df fdc">
                      <!-- <el-button>{{ t('oss.setTag') }}</el-button> -->
                      <el-button @click="clearDataChange(row)">
                        {{ t('oss.clearData') }}
                      </el-button>
                      <el-button @click="deleteDataChange(row)">
                        {{ t('oss.delete') }}
                      </el-button>
                    </div>
                  </template>
                  <el-link type="primary">
                    {{ t('more') }}
                    <SvgIcon name="cat-cdn-select-more" class="ml4" />
                  </el-link>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          :custom-keys="['page', 'pageSize']"
          @change="paginationChange"
        />
      </div>
    </div>

    <!-- 设置table column -->
    <SettingTableColumDialog
      ref="settingTableColumRef"
      v-model:check-list="visibleColumns"
      @confirm="confirmTableHead"
    />

    <!-- 导出 -->
    <CatDialog
      v-if="exportDialog"
      v-model:dialog="exportDialog"
      :title="$t('oss.exportBucketList')"
      :width="dialogClass"
      @update:dialog="exportCancel"
      @open="exportOpen"
      @confirm="exportConfirmHandle"
    >
      <div class="df ac">
        <p class="mr20" style="color: #999">
          {{ t('oss.exportRange') }}
        </p>
        <CatRadioGroup
          v-model="exportRadio"
          :list="[
            { label: t('oss.exportAllBucketList'), value: 1 },
            { label: t('oss.exportSelectedBucketList'), value: 2, disabled: selectList.length === 0 },
          ]"
        />
      </div>
    </CatDialog>

    <!-- 创建存储桶 -->
    <CreateOsDialog
      v-if="createOsDialogShow"
      ref="createOsDialogRef"
      v-model:show="createOsDialogShow"
      @success="getList"
    />

    <!-- 清空桶 -->
    <ClearBucket v-model:show="clearBucketDialog" :curr-select-bucket="currSelectBucket" @success="getList" />

    <!-- 删除桶 -->
    <DeleteBucket
      v-model:show="deleteBucketDialog"
      :curr-select-bucket="currSelectBucket"
      @to-clear-bucket="toClearBucket"
      @success="getList"
    />

    <!-- 任务中心 -->
    <TaskList ref="taskListRef" v-model:show="taskDialog" />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { IPagination } from '@/views/account-system/type'
import SettingTableColumDialog from './components/setting-table-colum-dialog.vue'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import t from '@/utils/i18n'
import CreateOsDialog from './components/create-os-dialog.vue'
import { _exportAllStorageList, _getStorageList, _exportStorageList, _getStorageQuota } from '@/apis/oss/storage-list'
import { downloadExportFiles } from '@/utils/download'
import { useOssStore, useTempStore, useUserStore } from '@/store'

import ClearBucket from './components/clear-bucket.vue'
import DeleteBucket from './components/delete-bucket.vue'
import TaskList from '../detail/components/task-list.vue'
import { useTableHeight } from '../../hooks/use-table-height'
import { formatFileSize } from '../../utils/upload'
import { notify } from '@/utils/notification'
import { pushRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogMap = {
  [ja]: '810px',
  [en]: '940px',
  [zh]: '810px',
}
const operationMap = {
  [ja]: 180,
  [en]: 300,
  [zh]: 180,
}
const dialogClass = useI18nStyle(dialogMap)
const operationWidth = useI18nStyle(operationMap)
const tableRef = ref(null)
const { tableHeight } = useTableHeight(tableRef)

const ossStore = useOssStore()
const userStore = useUserStore()
const appId = computed(() => userStore.user.appId || '')

const search = ref<any>({
  bucketName: '',
  key: 1,
  // 地域
  region: 'all',
  sortOrder: '', // asc升序 desc降序
})

const visibleColumns = ref<number[]>([])

const settingTableColumRef = ref<any>(null)
const createOsDialogShow = ref(false)

const dataList = ref([])
const selectList = ref<any[]>([]) // 选中的
const loading = ref(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const exportDialog = ref(false)
const exportRadio = ref(1)

const handleRowSelectChange = (selection: any) => {
  selectList.value = selection
}

const createBucketFn = async () => {
  const res = await _getStorageQuota({ appid: appId.value })
  if (!res.data.allowed) {
    notify.error({
      message: t('oss.maxBucketCount'),
      offset: 100,
      duration: 3000,
    })
    return
  }
  createOsDialogShow.value = true
}

const buyPackageFn = () => {
  pushRoute({
    name: 'oss_res_create',
    query: {
      isDefaultCreate: 'true',
    },
  })
}

const refresh = () => {
  paginationConfig.pagination.page = 1
  search.value.bucketName = ''
  search.value.key = 1
  search.value.region = 'all'
  search.value.sortOrder = 'desc'
  getList()
}

const sortOrdersChange = () => {
  search.value.sortOrder = search.value.sortOrder === 'desc' ? 'asc' : 'desc'

  getList()
}

const paginationChange = e => {
  paginationConfig.pagination.page = e.page
  paginationConfig.pagination.pageSize = e.pageSize
  getList()
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const exportCancel = () => {
  exportDialog.value = false
}

const exportOpen = () => {
  exportDialog.value = true
}

const exportConfirmHandle = async () => {
  console.log('confirm')
  let blob: any = null
  if (exportRadio.value === 1) {
    blob = await _exportAllStorageList()
  } else {
    const bucketIds = selectList.value.map(item => item.name)
    blob = await _exportStorageList({ bucketIds })
  }
  console.log(blob)

  await downloadExportFiles(blob, 'bucket-list.xlsx')
  exportCancel()
}

const confirmTableHead = (e: any) => {
  visibleColumns.value = e
  localStorage.ossHeadList = JSON.stringify(e)
}

// 获取列表
const getList = () => {
  loading.value = true
  _getStorageList({
    page: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    bucketName: search.value.key === 1 ? search.value.bucketName : undefined,
    region: search.value.region,
    sortOrder: search.value.sortOrder,
  })
    .then((res: any) => {
      dataList.value = res.data?.list
      paginationConfig.total = res.data?.total
    })
    .finally(() => {
      loading.value = false
    })
}

// 跳转详情
const toDetail = (row: any, type?: number) => {
  const id = row.bucektId
  ossStore.updateBucketInfo(row)
  pushRoute({
    name: 'bucket_detail',
    params: {
      id,
      region: row.region,
      name: row.name,
    },
    query: type
      ? {
          active: type,
        }
      : {},
  })
}

/****** 清空桶 start  *******/
const clearBucketDialog = ref(false)
const currSelectBucket = ref<any>({})

const clearDataChange = row => {
  currSelectBucket.value = row
  clearBucketDialog.value = true
}

/******删除桶 */
const deleteBucketDialog = ref(false)
const deleteDataChange = row => {
  currSelectBucket.value = row
  deleteBucketDialog.value = true
}

const toClearBucket = () => {
  deleteBucketDialog.value = false
  clearBucketDialog.value = true
}

/*****任务中心 */
const taskDialog = ref(false)
const openTask = () => {
  taskDialog.value = true
}

onMounted(() => {
  useTempStore().setPageHeader(false)
  ossStore.checkHasTasks()
  getList()
  visibleColumns.value = localStorage.ossHeadList ? JSON.parse(localStorage.ossHeadList) : [1, 3, 4, 5, 6, 7]
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
// .el-table {
//   :deep(.file-name-column) {
//     .cell {
//       width: 100%;
//     }
//   }
// }
.btn-wrap {
  display: flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
}

.cat-pagination {
  padding-bottom: 0;
}

.more-list {
  .el-button {
    margin-bottom: 4px;
    margin-left: 0 !important;
    border: none;

    &:hover {
      background-color: rgb(241 242 252);
    }

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .el-popper {
    .popper-text {
      width: max-content;
    }
  }
}
</style>
