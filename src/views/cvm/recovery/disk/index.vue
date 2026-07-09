<template>
  <div>
    <PageHeader :title="t('disk.list.disk')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <div style="padding: 20px" class="page-box">
        <div class="df ac jsb">
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('recovery.disk.list.listPh')"
              :filter-list="iptFilterConfig"
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
          class="mt20 table"
          @selection-change="handleRowSelectChange"
          @row-click="row => console.log(row)"
        >
          <!-- ID/名称 -->
          <el-table-column min-width="240" :label="t('disk.list.idName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <el-badge v-if="row.renewFlag === 1" :value="t('disk.list.continue')" class="item" type="warning">
                  <div class="text-primary pointer mr10">
                    <Copy :text="row.diskId" style="display: inline-block" @handle-click="toDetail(row)" />
                  </div>
                </el-badge>
                <div v-else class="text-primary pointer mr4">
                  <Copy :text="row.diskId" style="display: inline-block" @handle-click="toDetail(row)" />
                </div>
                <div class="text-over">
                  {{ row.diskName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column min-width="230" :label="t('disk.list.state')" show-overflow-tooltip>
            <template #default="{ row }">
              <div style="display: inline-block">
                <div class="df ac">
                  <StatusGroup :list="DISK_STATE_ARR_MAP" :value="row.state" />
                  <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 可用区 -->
          <el-table-column min-width="150" :label="t('disk.list.zone')">
            <template #header>
              <TableHeadFilter
                ref="zoneNameThFilterRef"
                v-model="tableFilterConfig.zoneIds.value"
                :label="t('disk.list.zone')"
                tip=""
                :field-key="tableFilterConfig.zoneIds.fieldKey"
                :field-type="tableFilterConfig.zoneIds.fieldType"
                :list="tableFilterConfig.zoneIds.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div>{{ row.zoneName }}</div>
            </template>
          </el-table-column>
          <!-- 属性 -->
          <el-table-column min-width="150" :label="t('disk.list.attr')">
            <template #header>
              <TableHeadFilter
                ref="typeThFilterRef"
                v-model="tableFilterConfig.typeList.value"
                :label="t('disk.list.attr')"
                tip=""
                :field-key="tableFilterConfig.typeList.fieldKey"
                :field-type="tableFilterConfig.typeList.fieldType"
                :list="tableFilterConfig.typeList.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div>{{ DISK_TYPE_MAP[row.type] }}</div>
            </template>
          </el-table-column>
          <!-- 类型 -->
          <el-table-column min-width="200" :label="t('disk.list.diskType')">
            <template #header>
              <TableHeadFilter
                ref="diskTypeThFilterRef"
                v-model="tableFilterConfig.diskTypeList.value"
                :label="t('disk.list.diskType')"
                tip=""
                :field-key="tableFilterConfig.diskTypeList.fieldKey"
                :field-type="tableFilterConfig.diskTypeList.fieldType"
                :list="tableFilterConfig.diskTypeList.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div>{{ row.diskType || '-' }}</div>
            </template>
          </el-table-column>
          <!-- 容量 -->
          <el-table-column min-width="120" sortable :label="t('disk.list.size')" :sort-method="sortMethod">
            <template #default="{ row }">
              <div>{{ row.size }}GiB</div>
            </template>
          </el-table-column>
          <!-- 隔离前挂载的实例 -->
          <el-table-column min-width="200" :label="t('recovery.disk.list.beforeMontedIns')" show-overflow-tooltip>
            <template #header>
              <EllipsisTooltip class="before-mounted-header" :text="t('recovery.disk.list.beforeMontedIns')" />
            </template>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div v-if="handleAssociateIns(row).show" class="text-primary">
                  {{ row.insUuid }}
                </div>
                <div v-if="handleAssociateIns(row).show" class="text-over">
                  {{ row.instanceName }}
                </div>
                <div v-if="!handleAssociateIns(row).show">-</div>
              </div>
            </template>
          </el-table-column>
          <!-- 计费模式 -->
          <el-table-column min-width="220" :label="t('recovery.disk.list.costType')">
            <template #default="{ row }">
              <span>{{ COST_TYPE_BTN_GROUP_MAP.find(item => item.value === row.costType)?.label || '' }}</span>
              <RecoveryTimeFormateText
                :cost-type="row.costType"
                :destruction-time="row.destructionTime || ''"
                :expires-time="row.expiredTime || ''"
              />
            </template>
          </el-table-column>
          <!-- 释放倒计时 -->
          <el-table-column min-width="220" :label="t('recovery.common.releaseCountdown')">
            <template #default="{ row }">
              <RecoveryTimeFormateText
                :cost-type="row.costType"
                :destruction-time="row.destructionTime || ''"
                :expires-time="row.expiredTime || ''"
                :show-detailed="true"
              />
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column fixed="right" min-width="300" :label="t('disk.list.opts')">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 恢复 -->
                <DisableText
                  v-if="checkPermission(permMap.diskRecovery.DISK_RECYCLE_BIN_RECOVER)"
                  class="mr20"
                  :disabled="!isRenew(row.type, row.costType, row.state)"
                  :text="t('recovery.common.renew')"
                  @click="handleRenew(row)"
                />
                <!-- 释放 -->
                <DisableText
                  v-if="checkPermission(permMap.diskRecovery.DISK_RECYCLE_BIN_RELEASE)"
                  class="mr20"
                  :disabled="!isDestruction(row.type, row.state)"
                  :text="t('recovery.common.release')"
                  @click="handleDestruction(row)"
                />
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

    <!-- 销毁/退还 -->
    <Destruction ref="destructionRef" :disk-list="destructionConfig.list" @success="listDiskFn" />
    <!-- 续费 -->
    <Renew ref="renewRef" :disk="disk" @success="listDiskFn" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import { AreaSelectType } from '@/store/cvm'
import {
  DISK_TYPE_MAP,
  DISK_STATE_ARR_MAP,
  DISK_STATE_FILTER_ARR_MAP,
  DISK_TYPE_FILTER_MAP,
  isRenew,
  COST_TYPE_BTN_GROUP_MAP,
  isDestruction,
} from '@/views/cvm/disk/config'
import { useCvmStore } from '@/store'

import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { _getAdminDiskRecyclePage } from '@/apis/cvm/disk'
import Destruction from './components/destruction.vue'
import Renew from './components/renew.vue'
import { httpUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'

const defaultTableFilterConfig: TableFilterConfigType = {
  states: {
    value: [],
    opts: DISK_STATE_FILTER_ARR_MAP,
    fieldKey: 'states',
    fieldType: 'check',
  },
  zoneIds: {
    value: [],
    opts: [],
    fieldKey: 'zoneIds',
    fieldType: 'check',
  },
  typeList: {
    value: [],
    opts: DISK_TYPE_FILTER_MAP,
    fieldKey: 'typeList',
    fieldType: 'check',
  },
  diskTypeList: {
    value: [],
    opts: [],
    fieldKey: 'diskTypeList',
    fieldType: 'check',
  },
}

const defaultIptFilterConfig = [
  { fieldName: t('disk.list.diskId'), fieldKey: 'diskId' },
  { fieldName: t('disk.list.zone'), fieldKey: 'zoneIds', fieldType: 'check', list: [] },
  { fieldName: t('disk.list.attr'), fieldKey: 'typeList', fieldType: 'check', list: DISK_TYPE_FILTER_MAP },
  {
    fieldName: t('disk.list.diskType'),
    fieldKey: 'diskTypeList',
    fieldType: 'check',
    list: [],
  },
]

const cvmStore = useCvmStore()
const { listDiskPrice, loading } = useDisk()
const { listByRegionId } = useBaseConfig()
const { handleThSelectFn, handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)

// 地区
const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})

const disk = ref<any>({}) // 当前硬盘
const list = ref<any[]>([]) // 列表
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

// 销毁/退还配置
const destructionConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('disk.list.destructionDesc1'),
})

const destructionRef = ref<InstanceType<typeof Destruction>>() // 销毁
const renewRef = ref<InstanceType<typeof Renew>>() // 续费
const zoneNameThFilterRef = ref<any>()
const typeThFilterRef = ref<any>()
const diskTypeThFilterRef = ref<any>()

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: {
      modeType: 2,
    },
    resourcesStateType: 'number',
    deleteStateValue: [10, 99],
  },
  list,
  toRef(paginationConfig, 'total'),
)
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.diskRecovery,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)
// 厂商权限配置
const permConfigSnapshot = reactive({
  moduleId: moduleMap.diskRecovery,
  regionId: 0,
})

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)

  paginationConfig.pagination.page = 1

  zoneNameThFilterRef.value?.updateCheck(search?.zoneIds)
  typeThFilterRef?.value.updateCheck(search?.typeList)
  diskTypeThFilterRef?.value.updateCheck(search?.diskTypeList)

  listDiskFn(search)
}

// 表格的筛选项同步到搜索框搜索项中
const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  console.log(`tableCheckFilterFn===>`, list, fieldKey)
  if (fieldKey === 'zoneIds') {
    handleThCheckFn(list, 'zoneIds', t('disk.list.zone'))
  }
  if (fieldKey === 'states') {
    handleThCheckFn(list, 'states', t('disk.list.state'))
  }
  if (fieldKey === 'typeList') {
    handleThCheckFn(list, 'typeList', t('disk.list.attr'))
  }
  if (fieldKey === 'diskTypeList') {
    handleThCheckFn(list, 'diskTypeList', t('disk.list.diskType'))
  }
}

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
  permConfigSnapshot.regionId = area.id
}

// 关联实例
const handleAssociateIns = (row: any) => {
  const config: any = {
    show: false,
  }
  config.show = row.insUuid || row.instanceName ? true : false

  return config
}

const refresh = () => {
  start()
  resetIptFn()
}

// 跳转详情
const toDetail = (row: any) => {
  const id = row.id

  pushRoute({
    name: 'disk_detail',
    params: {
      id,
    },
  })
}

// 排序
const sortMethod = (a, b) => {
  return a.size - b.size
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 续费
const handleRenew = (row: any) => {
  disk.value = row
  changeShow(renewRef.value)
}

// 销毁
const handleDestruction = (row: any) => {
  destructionConfig.list = [row]
  changeShow(destructionRef.value)
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {}

// 分页
const paginationChange = () => {
  listDiskFn()
}

// 硬盘列表
const listDiskFn = async (search = filterInputRef.value?.searchParams) => {
  notice(2)

  try {
    loading.value = true
    const params = {
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      regionId: cvmStore.areaSelect.id,
      states: [10],
      ...search,
    }
    const res = await _getAdminDiskRecyclePage(params)
    console.log(`_listDisk===>`, res)
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

// 硬盘类型列表
const listDiskPriceFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      iptFilterConfig.value[3].list = (res.data || []).map(el => ({ value: el.diskName, label: el.diskName }))
      tableFilterConfig.diskTypeList.opts = (res.data || []).map(el => ({ value: el.diskName, label: el.diskName }))
    }
  }

  const params = {
    costType: 2,
    regionId: cvmStore.areaSelect.id,
  }

  listDiskPrice(params, cb)
}

// 处理可用区
const listByRegionIdFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      const zoneList = res.data || []
      const arr = zoneList.map(el => ({
        label: el.zoneName,
        value: el.id,
      }))

      iptFilterConfig.value[1].list = arr
      tableFilterConfig.zoneIds.opts = arr
    }
  }
  const params = {
    regionId: cvmStore.areaSelect.id,
  }
  listByRegionId(params, cb)
}

watch(
  () => cvmStore.areaSelect.id,
  () => {
    resetIptFn()
    listDiskFn()
    listByRegionIdFn()
    listDiskPriceFn()
  },
)

onMounted(() => {
  useTempStore().setPageHeader(false)
  listDiskFn()
  listByRegionIdFn()
  listDiskPriceFn()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';

.table {
  .select-tr {
    margin-left: -12px;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none !important;

      .el-input__inner {
        &::placeholder {
          color: var(--primary-color) !important;
        }

        color: var(--primary-color) !important;
      }
    }
  }
}

:deep(.chargeTypeColumn .cell) {
  overflow: visible;
}

:deep(.el-badge__content.is-fixed) {
  transform: translateY(0%) translateX(100%);
}

:deep(.before-mounted-header) {
  width: 100%;
}

:deep(.select-input) {
  width: 650px;

  .el-select_content {
    width: 580px;

    .select_tags-list {
      max-width: 450px;
    }
  }
}
</style>
