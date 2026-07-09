<template>
  <div>
    <PageHeader :title="t('image.list.image')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <div style="padding: 20px" class="page-box">
        <div class="tabs-wrap mb20">
          <!-- tabs -->
          <CatTabs2 v-model="active" class="tabs" :tabs="IMAGE_TYPE_ARR_MAP" @change="changeActive" />
        </div>
        <!-- 公共镜像 -->
        <div v-show="active === 1" class="pd0-20">
          <div class="df jsb mb20">
            <div class="btn-wrap">
              <!-- 创建实例 -->
              <el-button
                v-if="checkPermission(permMap.image.IMAGE_CREATE_CUSTOMIZE_VM)"
                :type="createInsConfig.disabled ? '' : 'primary'"
                :disabled="createInsConfig.disabled"
                @click="batchCreateIns"
              >
                {{ t('image.list.createIns') }}
              </el-button>
            </div>

            <div class="search-wrap df ac">
              <FilterInput
                ref="commonImageFilterInputRef"
                :placeholder="t('image.list.listPh')"
                :filter-list="commonIptFilterConfig"
                @search="searchFn"
              />
              <CdnIconButton class="ml10" @click="refresh">
                <SvgIcon name="refresh" />
              </CdnIconButton>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="list"
            @selection-change="handleRowSelectChange"
            @row-click="row => console.log(row)"
          >
            <el-table-column type="selection" width="40" />
            <!-- ID/名称 -->
            <el-table-column min-width="300" :label="t('image.list.idName')">
              <template #default="{ row }">
                <div class="table-td_tooltip" style="width: 100%">
                  <div class="text-primary pointer">
                    <el-tooltip
                      effect="light"
                      :content="t('image.list.imageDesc', [row.description || '-'])"
                      placement="top"
                    >
                      <Copy style="display: inline-block" :text="row.insId" @handle-click="toDetail('common', row)" />
                    </el-tooltip>
                  </div>
                  <TableCopy :text="row.imageName" />
                </div>
              </template>
            </el-table-column>
            <!-- 状态 -->
            <el-table-column min-width="120" :label="t('image.list.state')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ IMAGE_STATE_MAP[row.state] }}</span>
                  <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
                </div>
              </template>
            </el-table-column>
            <!-- 类型 -->
            <el-table-column min-width="120" :label="t('image.list.type')">
              <template #default>
                <div>{{ IMAGE_TYPE_MAP[1] }}</div>
              </template>
            </el-table-column>
            <!-- 容量 -->
            <el-table-column min-width="120" :label="t('image.list.size')">
              <template #default="{ row }">
                <div>{{ row.size }}GiB</div>
              </template>
            </el-table-column>
            <!-- 操作系统 -->
            <el-table-column min-width="160" :label="t('image.list.sys')">
              <template #default="{ row }">
                <div>{{ row.platform }}</div>
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column min-width="200" :label="t('image.list.opts')" fixed="right">
              <template #default="{ row }">
                <div class="df ac">
                  <!-- 创建实例 -->
                  <DisableText
                    v-if="checkPermission(permMap.image.IMAGE_CREATE_CUSTOMIZE_VM)"
                    :disabled="!isCreateIns(row.state)"
                    :text="t('image.list.createIns')"
                    @click="createIns(row)"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 自定义镜像 -->
        <div v-show="active === 2" class="pd0-20">
          <div class="df jsb">
            <div class="btn-wrap">
              <!-- 创建自定义镜像 -->
              <el-button
                v-if="checkPermission(permMap.image.IMAGE_CREATE_CUSTOMIZE_VM)"
                type="primary"
                class="mb20"
                @click="changeShow(createCustomImageRef)"
              >
                {{ t('image.list.createImage') }}
              </el-button>
              <!-- 创建实例 -->
              <el-button
                v-if="checkPermission(permMap.image.IMAGE_CREATE_VM)"
                class="mb20"
                :disabled="createInsConfig.disabled"
                @click="batchCreateIns"
              >
                {{ t('image.list.createIns') }}
              </el-button>
              <!-- 删除 -->
              <el-button
                v-if="checkPermission(permMap.image.IMAGE_DELETE_CUSTOMIZE_VM)"
                class="mb20"
                :disabled="!selectList.length"
                @click="batchRemove"
              >
                {{ t('image.list.delete') }}
              </el-button>
            </div>

            <div class="search-wrap df">
              <div>
                <FilterInput
                  ref="customImageFilterInputRef"
                  :placeholder="t('image.list.listPh')"
                  :filter-list="customIptFilterConfig"
                  @search="searchFn"
                />
              </div>

              <CdnIconButton class="ml10" @click="refresh">
                <SvgIcon name="refresh" />
              </CdnIconButton>
              <CdnIconButton class="ml10" @click="exportImage">
                <SvgIcon name="cat-cdn-download" />
              </CdnIconButton>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="list"
            @selection-change="handleRowSelectChange"
            @row-click="row => console.log(row)"
          >
            <el-table-column type="selection" width="40" />
            <!-- ID/名称 -->
            <el-table-column min-width="240" :label="t('image.list.idName')">
              <template #default="{ row }">
                <div class="table-td_tooltip" style="width: 100%">
                  <div class="text-primary pointer">
                    <el-tooltip
                      effect="light"
                      :content="t('image.list.imageDesc', [row.description || '-'])"
                      placement="top"
                    >
                      <Copy style="display: inline-block" :text="row.insId" @handle-click="toDetail('custom', row)" />
                    </el-tooltip>
                  </div>
                  <div>
                    <TableCopy :text="row.imageName" />
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 状态 -->
            <el-table-column min-width="120" :label="t('image.list.state')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ IMAGE_STATE_MAP[row.state] }}</span>
                  <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
                </div>
              </template>
            </el-table-column>
            <!-- 类型 -->
            <el-table-column min-width="120" :label="t('image.list.type')">
              <template #default>
                <div>{{ IMAGE_TYPE_MAP[2] }}</div>
              </template>
            </el-table-column>
            <!-- 容量 -->
            <el-table-column min-width="120" :label="t('image.list.size')">
              <template #default="{ row }">
                <div>{{ row.size }}GiB</div>
              </template>
            </el-table-column>
            <!-- 操作系统 -->
            <el-table-column min-width="300" :label="t('image.list.sys')">
              <template #default="{ row }">
                <div>{{ row.osName }}</div>
              </template>
            </el-table-column>
            <!-- 创建时间 -->
            <el-table-column min-width="220" :label="t('image.list.createTime')">
              <template #header>
                <div class="df ac">
                  <span class="mr10">{{ t('image.list.createTime') }}</span>
                  <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" />
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div>{{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}</div>
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column min-width="280" :label="t('image.list.opts')" fixed="right">
              <template #default="{ row }">
                <div class="df ac">
                  <!-- 创建实例 -->
                  <DisableText
                    v-if="checkPermission(permMap.image.IMAGE_CREATE_VM)"
                    class="mr20"
                    :disabled="!isCreateIns(row.state)"
                    :text="t('image.list.createIns')"
                    @click="createIns(row)"
                  />
                  <!-- 删除 -->
                  <DisableText
                    v-if="checkPermission(permMap.image.IMAGE_DELETE_CUSTOMIZE_VM)"
                    class="mr20"
                    :disabled="!isDelete(row.state)"
                    :text="t('image.list.delete')"
                    @click="singleRemove(row)"
                  />
                  <!-- 修改 -->
                  <DisableText
                    v-if="checkPermission(permMap.image.SET_IMAGE_NAME)"
                    class="mr20"
                    :disabled="!isModify(row.state)"
                    :text="t('image.list.modify')"
                    @click="modifyImage(row)"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pd0-20">
          <CatPagination
            v-model:pagination="paginationConfig.pagination"
            :total="paginationConfig.total"
            :custom-keys="['page', 'pageSize']"
            @change="paginationChange"
          />
        </div>
      </div>
    </div>

    <!-- 创建自定义镜像 -->
    <CreateCustomImage ref="createCustomImageRef" @success="listImage" />
    <!-- 创建实例 -->
    <CreateIns ref="createInsRef" :image-list="createInsConfig.list" />
    <!-- 删除自定义镜像 -->
    <DeleteImage ref="deleteImageRef" :image-list="removeConfig.list" @success="listImage" />
    <!-- 修改自定义镜像 -->
    <ModifyImage ref="modifyImageRef" :image-list="[image]" @success="listImage" />
  </div>
</template>

<script setup lang="ts">
import { IPagination } from '@/views/account-system/type'
import t from '@/utils/i18n'
import CreateCustomImage from './components/create-custom-image.vue'
import CreateIns from './components/create-ins.vue'
import DeleteImage from './components/delete-image.vue'
import ModifyImage from './components/modify-image.vue'
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
import { AreaSelectType } from '@/store/cvm'
import { useTempStore } from '@/store'

import { message } from '@/utils/message'
import { downloadExportFiles } from '@/utils/download'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { httpUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const defaultIptFilterConfig = [
  { fieldName: t('image.list.imageId'), fieldKey: 'imageInsId' },
  { fieldName: t('image.list.imageName'), fieldKey: 'imageName' },
  {
    fieldName: t('image.list.imageSys'),
    fieldKey: 'platform',
    fieldType: 'check',
    list: IMAGE_PLATFORM_FILTER_ARR_MAP,
  },
  // { fieldName: t('image.list.imageSys'), fieldKey: 'osName' },
]

const route = useRoute()
const cvmStore = useCvmStore()
const {
  filterInputRef: commonImageFilterInputRef,
  iptFilterConfig: commonIptFilterConfig,
  resetIptFn: commonResetIptFn,
} = useFilter({}, defaultIptFilterConfig) // 公共镜像
const {
  filterInputRef: customImageFilterInputRef,
  iptFilterConfig: customIptFilterConfig,
  resetIptFn: customResetIptFn,
} = useFilter({}, defaultIptFilterConfig) // 自定义镜像

// 地区
const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})
const v = route.query.active as string
const active = ref(v ? Number(v) : 1)
const list = ref<any[]>([]) // 列表
const loading = ref<boolean>(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const selectList = ref<any[]>([]) // 选中的
const image = ref<any>({}) // 当前镜像
// 删除配置
const removeConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
}>({
  type: 'single',
  list: [],
})

// 创建实例配置
const createInsConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
  disabled: boolean
}>({
  type: 'single',
  list: [],
  disabled: true,
})
const curSearch = ref<any>({}) // 自定义镜像搜索条件

const createCustomImageRef = ref<InstanceType<typeof CreateCustomImage>>() // 创建自定义镜像
const createInsRef = ref<InstanceType<typeof CreateIns>>() // 创建实例
const deleteImageRef = ref<InstanceType<typeof DeleteImage>>() // 删除镜像
const modifyImageRef = ref<InstanceType<typeof DeleteImage>>() // 修改镜像

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

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.image,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
}

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)
  if (active.value === 2) {
    curSearch.value = search
  }
  paginationConfig.pagination.page = 1
  listImage()
}

// 是否能创建实例
const changeCreateInsConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    createInsConfig.disabled = true
  } else {
    // 勾选
    if (!isCreateInsBatch(selectList.value.map(el => el.state))) {
      createInsConfig.disabled = true
      return
    }

    const createInsList = selectList.value.filter(el => el.state === 1)
    createInsConfig.list = createInsList
    createInsConfig.disabled = false
  }
}

//跳转镜像详情
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

// 批量创建实例
const batchCreateIns = () => {
  createInsConfig.type = 'batch'
  createInsConfig.list = selectList.value
  changeShow(createInsRef.value)
}

// 创建实例
const createIns = (row: any) => {
  createInsConfig.type = 'single'
  createInsConfig.list = [row]
  changeShow(createInsRef.value)
}

// 修改
const modifyImage = (row: any) => {
  image.value = row
  changeShow(modifyImageRef.value)
}

// 删除
const singleRemove = (row: any) => {
  removeConfig.type = 'single'
  removeConfig.list = [row]
  changeShow(deleteImageRef.value)
}

// 批量删除
const batchRemove = () => {
  const arr = selectList.value.filter(el => [1, 6].includes(el.state))

  if (arr.length) {
    removeConfig.type = 'batch'
    removeConfig.list = arr
    changeShow(deleteImageRef.value)
  }
}

// 刷新
const refresh = () => {
  start()
  active.value === 1 ? commonResetIptFn() : customResetIptFn()
  // listImage()
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection

  changeCreateInsConfig()
}

// 切换镜像类型
const changeActive = (v: any) => {
  console.log(`changeActive===>`, v)
  // reset
  paginationConfig.pagination.page = 1
  paginationConfig.pagination.pageSize = 10
  selectList.value = []
  curSearch.value = {}
  active.value === 1 ? commonResetIptFn() : customResetIptFn()
}

// 分页
const paginationChange = () => {
  listImage()
}

// 镜像导出
const exportImage = async () => {
  try {
    const res = await _exportImage({
      regionId: cvmStore.areaSelect.id,
      imageType: active.value,
      ...curSearch.value,
    })

    console.log(`_exportImage===>`, res)

    if (!res.code) {
      const fileName = `image.xls`
      downloadExportFiles(res, fileName)
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

// 分页查询镜像列表
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

    console.log(`_listImage===>`, res)

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

watch(
  () => cvmStore.areaSelect.id,
  () => {
    active.value === 1 ? commonResetIptFn() : customResetIptFn()
    listImage()
  },
)

onMounted(() => {
  useTempStore().setPageHeader(false)
  listImage()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';

.tabs-wrap {
  box-sizing: border-box;
  background: #fff;
}

.card {
  background: #fff;
}
</style>
