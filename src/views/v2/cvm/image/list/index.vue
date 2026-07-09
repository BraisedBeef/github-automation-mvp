<template>
  <div class="cvm-image-list-v2">
    <PageBreadcrumbToolbar :items="[t('image.list.image')]" @doc="openHelpDoc" />

    <section class="cvm-image-list-v2__panel">
      <section class="cvm-image-list-v2__tabs">
        <CatTabs
          v-model="active"
          class="cvm-image-list-v2__tabs-inner"
          :tabs="IMAGE_TYPE_ARR_MAP"
          @change="changeActive"
        />
      </section>

      <div class="cvm-image-list-v2__toolbar">
        <div class="cvm-image-list-v2__actions">
          <template v-if="active === 1">
            <el-button
              v-if="checkPermission(permMap.image.IMAGE_CREATE_CUSTOMIZE_VM)"
              type="primary"
              :disabled="createInsConfig.disabled"
              @click="batchCreateIns"
            >
              {{ t('image.list.createIns') }}
            </el-button>
          </template>

          <template v-else>
            <el-button
              v-if="checkPermission(permMap.image.IMAGE_CREATE_CUSTOMIZE_VM)"
              type="primary"
              @click="changeShow(createCustomImageRef)"
            >
              {{ t('image.list.createImage') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.image.IMAGE_CREATE_VM)"
              :disabled="createInsConfig.disabled"
              @click="batchCreateIns"
            >
              {{ t('image.list.createIns') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.image.IMAGE_DELETE_CUSTOMIZE_VM)"
              :disabled="!selectList.length"
              @click="batchRemove"
            >
              {{ t('image.list.delete') }}
            </el-button>
          </template>
        </div>

        <div class="cvm-image-list-v2__tools">
          <FilterInput
            v-show="active === 1"
            ref="commonImageFilterInputRef"
            class="cvm-image-list-v2__filter"
            :placeholder="t('image.list.listPh')"
            :filter-list="commonIptFilterConfig"
            @search="searchFn"
          />
          <FilterInput
            v-show="active === 2"
            ref="customImageFilterInputRef"
            class="cvm-image-list-v2__filter"
            :placeholder="t('image.list.listPh')"
            :filter-list="customIptFilterConfig"
            @search="searchFn"
          />
          <CdnIconButton class="cvm-image-list-v2__icon-btn" @click="refresh">
            <SvgIcon name="refresh" />
          </CdnIconButton>
          <CdnIconButton v-if="active === 2" class="cvm-image-list-v2__icon-btn" @click="exportImage">
            <SvgIcon name="cat-cdn-download" />
          </CdnIconButton>
        </div>
      </div>

      <TableV2
        v-loading="loading"
        :data="list"
        :total="paginationConfig.total"
        :pagination="paginationConfig.pagination"
        :empty-min-height="420"
        show-pagination
        @selection-change="handleRowSelectChange"
        @change="paginationChange"
      >
        <el-table-column type="selection" width="54" />

        <el-table-column min-width="320" :label="t('image.list.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-image-list-v2__name-cell">
              <div class="cvm-image-list-v2__link">
                <Copy
                  :text="row.insId"
                  style="display: inline-block"
                  @handle-click="toDetail(active === 2 ? 'custom' : 'common', row)"
                />
              </div>
              <div class="cvm-image-list-v2__subtext">
                {{ row.imageName || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="t('image.list.state')">
          <template #default="{ row }">
            <div class="cvm-image-list-v2__status-cell">
              <span>{{ IMAGE_STATE_MAP[row.state] }}</span>
              <SvgIcon v-if="row.loadingState" class="cvm-image-list-v2__loading-icon" name="loading" />
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="160" :label="t('image.list.type')">
          <template #default>
            {{ IMAGE_TYPE_MAP[active] }}
          </template>
        </el-table-column>

        <el-table-column min-width="120" :label="t('image.list.size')">
          <template #default="{ row }"> {{ row.size }}GiB </template>
        </el-table-column>

        <el-table-column min-width="280" :label="t('image.list.sys')" show-overflow-tooltip>
          <template #default="{ row }">
            {{ active === 2 ? row.osName || row.platform || '-' : row.platform || '-' }}
          </template>
        </el-table-column>

        <el-table-column v-if="active === 2" min-width="220">
          <template #header>
            <div class="cvm-image-list-v2__time-head">
              <span>{{ t('image.list.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="cvm-image-list-v2__time-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <el-table-column :min-width="active === 2 ? 260 : 180" fixed="right" :label="t('image.list.opts')">
          <template #default="{ row }">
            <div class="cvm-image-list-v2__ops">
              <DisableText
                v-if="active === 1 && checkPermission(permMap.image.IMAGE_CREATE_CUSTOMIZE_VM)"
                :disabled="!isCreateIns(row.state)"
                :text="t('image.list.createIns')"
                disabled-type="hidden"
                @click="createIns(row)"
              />

              <template v-if="active === 2">
                <DisableText
                  v-if="checkPermission(permMap.image.IMAGE_CREATE_VM)"
                  :disabled="!isCreateIns(row.state)"
                  :text="t('image.list.createIns')"
                  disabled-type="hidden"
                  @click="createIns(row)"
                />
                <DisableText
                  v-if="checkPermission(permMap.image.IMAGE_DELETE_CUSTOMIZE_VM)"
                  :disabled="!isDelete(row.state)"
                  :text="t('image.list.delete')"
                  disabled-type="hidden"
                  @click="singleRemove(row)"
                />
                <DisableText
                  v-if="checkPermission(permMap.image.SET_IMAGE_NAME)"
                  :disabled="!isModify(row.state)"
                  :text="t('image.list.modify')"
                  disabled-type="hidden"
                  @click="modifyImage(row)"
                />
              </template>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CreateCustomImage ref="createCustomImageRef" @success="listImage" />
    <CreateIns ref="createInsRef" :image-list="createInsConfig.list" />
    <DeleteImage ref="deleteImageRef" :image-list="removeConfig.list" @success="listImage" />
    <ModifyImage ref="modifyImageRef" :image-list="[image]" @success="listImage" />
  </div>
</template>

<script setup lang="ts">
import { IPagination } from '@/views/account-system/type'
import t from '@/utils/i18n'
import CreateCustomImage from '@/views/cvm/image/list/components/create-custom-image.vue'
import CreateIns from '@/views/cvm/image/list/components/create-ins.vue'
import DeleteImage from '@/views/cvm/image/list/components/delete-image.vue'
import ModifyImage from '@/views/cvm/image/list/components/modify-image.vue'
import { _listImage, _exportImage } from '@/apis/cvm/image'
import { useCvmStore } from '@/store'
import {
  IMAGE_STATE_MAP,
  IMAGE_TYPE_ARR_MAP,
  IMAGE_TYPE_MAP,
  isCreateIns,
  isDelete,
  isModify,
  isCreateInsBatch,
  IMAGE_PLATFORM_FILTER_ARR_MAP,
} from '@/views/cvm/image/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { message } from '@/utils/message'
import { downloadExportFiles } from '@/utils/download'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { httpUrl, documentUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { replaceRoute } from '@/utils/router-jump'

const defaultIptFilterConfig = [
  { fieldName: t('image.list.imageId'), fieldKey: 'imageInsId' },
  { fieldName: t('image.list.imageName'), fieldKey: 'imageName' },
  {
    fieldName: t('image.list.imageSys'),
    fieldKey: 'platform',
    fieldType: 'check',
    list: IMAGE_PLATFORM_FILTER_ARR_MAP,
  },
]

const route = useRoute()
const cvmStore = useCvmStore()
const {
  filterInputRef: commonImageFilterInputRef,
  iptFilterConfig: commonIptFilterConfig,
  resetIptFn: commonResetIptFn,
} = useFilter({}, defaultIptFilterConfig)
const {
  filterInputRef: customImageFilterInputRef,
  iptFilterConfig: customIptFilterConfig,
  resetIptFn: customResetIptFn,
} = useFilter({}, defaultIptFilterConfig)

const v = route.query.active as string
const active = ref(v ? Number(v) : 1)
const list = ref<any[]>([])
const loading = ref(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const selectList = ref<any[]>([])
const image = ref<any>({})
const removeConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
}>({
  type: 'single',
  list: [],
})
const createInsConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
  disabled: boolean
}>({
  type: 'single',
  list: [],
  disabled: true,
})

const createCustomImageRef = ref<InstanceType<typeof CreateCustomImage>>()
const createInsRef = ref<InstanceType<typeof CreateIns>>()
const deleteImageRef = ref<InstanceType<typeof DeleteImage>>()
const modifyImageRef = ref<InstanceType<typeof DeleteImage>>()

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: {
      modeType: 3,
    },
    resourcesStateType: 'number',
  },
  list,
  toRef(paginationConfig, 'total'),
)

const permConfig = reactive({
  moduleId: moduleMap.image,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const changeCreateInsConfig = () => {
  if (!selectList.value.length) {
    createInsConfig.disabled = true
  } else {
    if (!isCreateInsBatch(selectList.value.map(el => el.state))) {
      createInsConfig.disabled = true
      return
    }

    createInsConfig.list = selectList.value.filter(el => el.state === 1)
    createInsConfig.disabled = false
  }
}

const searchFn = () => {
  paginationConfig.pagination.page = 1
  listImage()
}

const toDetail = (type: string, row: any) => {
  type === 'custom'
    ? pushRoute({
        name: 'image_custom_detail',
        params: {
          id: row.id,
        },
      })
    : pushRoute({
        name: 'image_common_detail',
        params: {
          id: row.id,
        },
      })
}

const batchCreateIns = () => {
  createInsConfig.type = 'batch'
  createInsConfig.list = selectList.value
  changeShow(createInsRef.value)
}

const createIns = (row: any) => {
  createInsConfig.type = 'single'
  createInsConfig.list = [row]
  changeShow(createInsRef.value)
}

const modifyImage = (row: any) => {
  image.value = row
  changeShow(modifyImageRef.value)
}

const singleRemove = (row: any) => {
  removeConfig.type = 'single'
  removeConfig.list = [row]
  changeShow(deleteImageRef.value)
}

const batchRemove = () => {
  const arr = selectList.value.filter(el => [1, 6].includes(el.state))
  if (arr.length) {
    removeConfig.type = 'batch'
    removeConfig.list = arr
    changeShow(deleteImageRef.value)
  }
}

const refresh = () => {
  start()
  active.value === 1 ? commonResetIptFn() : customResetIptFn()
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const handleRowSelectChange = (selection: any) => {
  selectList.value = selection
  changeCreateInsConfig()
}

const changeActive = (v: any) => {
  const value = Number(v?.value ?? v)
  paginationConfig.pagination.page = 1
  paginationConfig.pagination.pageSize = 10
  selectList.value = []
  active.value = value
  active.value === 1 ? commonResetIptFn() : customResetIptFn()
  replaceRoute({
    query: {
      ...route.query,
      active: String(value),
    },
  })
  listImage()
}

const paginationChange = () => {
  listImage()
}

const exportImage = async () => {
  try {
    const res = await _exportImage({
      regionId: cvmStore.areaSelect.id,
      imageType: active.value,
      ...(customImageFilterInputRef.value?.searchParams || {}),
    })

    if (!res.code) {
      downloadExportFiles(res, 'image.xls')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

const listImage = async () => {
  notice(3)
  const search =
    active.value === 1
      ? commonImageFilterInputRef.value?.searchParams || {}
      : customImageFilterInputRef.value?.searchParams || {}

  try {
    loading.value = true
    const res = await _listImage({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      regionId: cvmStore.areaSelect.id,
      imageType: active.value,
      ...search,
    })

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const openHelpDoc = () => {
  window.open(`${documentUrl}/cvm/list`, '_blank')
}

watch(
  () => cvmStore.areaSelect.id,
  () => {
    permConfig.regionId = cvmStore.areaSelect.id
    active.value === 1 ? commonResetIptFn() : customResetIptFn()
    listImage()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.cvm-image-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cvm-image-list-v2__panel {
  padding: 24px 28px 28px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-image-list-v2__tabs {
  // padding-bottom: 12px;
  // border-bottom: 1px solid #e8ecf3;
}

.cvm-image-list-v2__tabs-inner {
  :deep(.el-tabs__header) {
    margin: 0;
  }
}

.cvm-image-list-v2__toolbar {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.cvm-image-list-v2__actions,
.cvm-image-list-v2__tools,
.cvm-image-list-v2__status-cell,
.cvm-image-list-v2__time-head,
.cvm-image-list-v2__ops {
  display: flex;
  align-items: center;
}

.cvm-image-list-v2__actions,
.cvm-image-list-v2__ops {
  gap: 12px;
}

.cvm-image-list-v2__tools {
  flex-shrink: 0;
  gap: 12px;
}

.cvm-image-list-v2__filter {
  width: 344px;
}

.cvm-image-list-v2__name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.cvm-image-list-v2__link {
  color: #06f;
}

.cvm-image-list-v2__subtext {
  color: #191c23;
}

.cvm-image-list-v2__loading-icon,
.cvm-image-list-v2__time-icon {
  margin-left: 6px;
}

.cvm-image-list-v2__time-head {
  gap: 6px;
}

@media (width <= 1200px) {
  .cvm-image-list-v2__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .cvm-image-list-v2__tools {
    width: 100%;
  }

  .cvm-image-list-v2__filter {
    flex: 1;
    width: auto;
  }
}

@media (width <= 768px) {
  .cvm-image-list-v2__panel {
    padding: 16px;
  }

  .cvm-image-list-v2__actions,
  .cvm-image-list-v2__tools {
    flex-wrap: wrap;
  }

  .cvm-image-list-v2__tools {
    align-items: stretch;
  }

  .cvm-image-list-v2__filter {
    width: 100%;
  }
}

.el-button + .el-button {
  margin-left: 0 !important;
}
</style>
